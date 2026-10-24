import { Router } from 'express';
import Item from '../models/Item.js';
import Bill from '../models/Bill.js';
import { TAX_RATE, round2 } from '../config/billing.js';

const router = Router();

const makeInvoiceNo = () =>
  `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

// Put back stock that was already deducted when checkout fails part-way
async function restoreStock(deducted) {
  for (const { id, quantity } of deducted) {
    await Item.updateOne({ _id: id }, { $inc: { quantity } });
  }
}

// GET /api/bills -> latest 50 bills of this user
router.get('/', async (req, res, next) => {
  try {
    const bills = await Bill.find({ owner: req.user.id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json(bills);
  } catch (err) {
    next(err);
  }
});

// POST /api/bills  body: { customerName, items: [{ name, quantity }] }
router.post('/', async (req, res, next) => {
  const owner = req.user.id;
  const customerName = String(req.body.customerName ?? '').trim() || 'Walk-in customer';
  const requested = Array.isArray(req.body.items) ? req.body.items : [];

  // Validate and merge duplicate lines
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
    return res.status(400).json({ message: 'The bill is empty. Add items before checkout.' });
  }

  const deducted = [];

  try {
    const lines = [];

    for (const { name, quantity } of merged.values()) {
      const nameKey = name.toLowerCase();

      // Atomic: deduct only if this user has enough stock
      const item = await Item.findOneAndUpdate(
        { owner, nameKey, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true }
      );

      if (!item) {
        await restoreStock(deducted);
        const existing = await Item.findOne({ owner, nameKey }).lean();
        const message = existing
          ? `Only ${existing.quantity} of ${existing.name} available.`
          : `"${name}" was not found in your inventory.`;
        return res.status(409).json({ message });
      }

      deducted.push({ id: item._id, quantity });
      lines.push({ name: item.name, rate: item.rate, quantity, amount: round2(item.rate * quantity) });
    }

    // subtotal = Σ amount_i
    const subtotal = round2(lines.reduce((sum, l) => sum + l.amount, 0));
    // taxAmount = subtotal × TAX_RATE / 100
    const taxAmount = round2((subtotal * TAX_RATE) / 100);
    // total = subtotal + taxAmount
    const total = round2(subtotal + taxAmount);

    const bill = await Bill.create({
      owner,
      invoiceNo: makeInvoiceNo(),
      customerName,
      lines,
      subtotal,
      taxRate: TAX_RATE,
      taxAmount,
      total,
    });

    res.status(201).json(bill);
  } catch (err) {
    await restoreStock(deducted);
    next(err);
  }
});

export default router;
