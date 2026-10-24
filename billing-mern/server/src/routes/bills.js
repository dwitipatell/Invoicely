import { Router } from 'express';
import Item from '../models/Item.js';
import Bill from '../models/Bill.js';

const router = Router();

const round2 = (n) => Math.round(n * 100) / 100;

// Put back any stock that was already deducted when checkout fails part-way
async function restoreStock(deducted) {
  for (const { id, quantity } of deducted) {
    await Item.updateOne({ _id: id }, { $inc: { quantity } });
  }
}

// GET /api/bills  -> latest 50 bills
router.get('/', async (req, res, next) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(bills);
  } catch (err) {
    next(err);
  }
});

// POST /api/bills  body: { items: [{ name, quantity }] }
router.post('/', async (req, res, next) => {
  const requested = Array.isArray(req.body.items) ? req.body.items : [];

  // Validate input and merge duplicate lines (same item picked twice)
  const merged = new Map();
  for (const line of requested) {
    const name = String(line?.name ?? '').trim();
    const quantity = Number(line?.quantity);
    if (!name || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Each line needs a name and a positive whole quantity.' });
    }
    const key = name.toLowerCase();
    merged.set(key, { name, quantity: (merged.get(key)?.quantity ?? 0) + quantity });
  }

  if (merged.size === 0) {
    return res.status(400).json({ message: 'The bill is empty. Please add items before checking out.' });
  }

  const deducted = [];

  try {
    const lines = [];

    for (const { name, quantity } of merged.values()) {
      const nameKey = name.toLowerCase();

      // Deduct only if enough stock exists, in one atomic database operation
      const item = await Item.findOneAndUpdate(
        { nameKey, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true }
      );

      if (!item) {
        await restoreStock(deducted);
        const existing = await Item.findOne({ nameKey }).lean();
        const message = existing
          ? `Only ${existing.quantity} of ${existing.name} are available.`
          : `"${name}" was not found in inventory.`;
        return res.status(409).json({ message });
      }

      deducted.push({ id: item._id, quantity });
      // amount = rate × quantity
      lines.push({ name: item.name, rate: item.rate, quantity, amount: round2(item.rate * quantity) });
    }

    // total = Σ amount_i
    const total = round2(lines.reduce((sum, line) => sum + line.amount, 0));
    const bill = await Bill.create({ lines, total });

    res.status(201).json(bill);
  } catch (err) {
    await restoreStock(deducted);
    next(err);
  }
});

export default router;
