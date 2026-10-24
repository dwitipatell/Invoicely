import { Router } from 'express';
import Item from '../models/Item.js';

const router = Router();

// GET /api/items  -> all items, sorted by name
router.get('/', async (req, res, next) => {
  try {
    const items = await Item.find().sort({ name: 1 }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/items  body: { name, rate, quantity }
router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name ?? '').trim();
    const rate = Number(req.body.rate);
    const quantity = Number(req.body.quantity);

    if (!name || !(rate > 0) || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ message: 'Please enter valid item details.' });
    }

    const nameKey = name.toLowerCase();
    const existing = await Item.findOne({ nameKey });

    if (existing) {
      existing.rate = rate;                 // newest rate wins
      existing.quantity += quantity;        // quantity = old + new
      await existing.save();
      return res.json({ item: existing, created: false });
    }

    const item = await Item.create({ name, nameKey, rate, quantity });
    res.status(201).json({ item, created: true });
  } catch (err) {
    next(err);
  }
});

export default router;
