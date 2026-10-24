import { Router } from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Bill from '../models/Bill.js';
import { TAX_RATE, LOW_STOCK_THRESHOLD, round2 } from '../config/billing.js';

const router = Router();

// GET /api/dashboard  -> totals for the logged-in user only
router.get('/', async (req, res, next) => {
  try {
    const owner = new mongoose.Types.ObjectId(req.user.id);

    const [totals, topItems, lowStock, itemCount] = await Promise.all([
      // Revenue and bill count
      Bill.aggregate([
        { $match: { owner } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, billCount: { $sum: 1 } } },
      ]),
      // Top 5 items by sales: unwind each bill's lines, group by item name
      Bill.aggregate([
        { $match: { owner } },
        { $unwind: '$lines' },
        {
          $group: {
            _id: '$lines.name',
            quantitySold: { $sum: '$lines.quantity' },
            revenue: { $sum: '$lines.amount' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: '$_id', quantitySold: 1, revenue: 1 } },
      ]),
      Item.find({ owner: req.user.id, quantity: { $lte: LOW_STOCK_THRESHOLD } })
        .sort({ quantity: 1 })
        .lean(),
      Item.countDocuments({ owner: req.user.id }),
    ]);

    res.json({
      totalRevenue: round2(totals[0]?.totalRevenue ?? 0),
      billCount: totals[0]?.billCount ?? 0,
      itemCount,
      topItems,
      lowStock,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      taxRate: TAX_RATE,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
