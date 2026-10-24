import { Router } from 'express';
import Item from '../models/Item.js';

const router = Router();

// Validate and normalise item input. Returns null if invalid.
function parseItem(body) {
  const name = String(body.name ?? '').trim();
  const rate = Number(body.rate);
  const quantity = Number(body.quantity);
  if (!name || !(rate > 0) || !Number.isInteger(quantity) || quantity < 0) return null;
  return { name, nameKey: name.toLowerCase(), rate, quantity };
}

// Every query is limited to the logged-in user's own items (req.user.id)

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user.id }).sort({ name: 1 }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/items  -> add new, or restock an existing one
router.post('/', async (req, res, next) => {
  try {
    const parsed = parseItem(req.body);
    if (!parsed) return res.status(400).json({ message: 'Please enter valid item details.' });

    const existing = await Item.findOne({ owner: req.user.id, nameKey: parsed.nameKey });
    if (existing) {
      existing.rate = parsed.rate;             // newest rate wins
      existing.quantity += parsed.quantity;    // quantity = old + new
      await existing.save();
      return res.json({ item: existing, created: false });
    }

    const item = await Item.create({ ...parsed, owner: req.user.id });
    res.status(201).json({ item, created: true });
  } catch (err) {
    next(err);
  }
});

// PUT /api/items/:id  -> edit name, rate, quantity
router.put('/:id', async (req, res, next) => {
  try {
    const parsed = parseItem(req.body);
    if (!parsed) return res.status(400).json({ message: 'Please enter valid item details.' });

    const clash = await Item.findOne({
      owner: req.user.id,
      nameKey: parsed.nameKey,
      _id: { $ne: req.params.id },
    });
    if (clash) return res.status(409).json({ message: `Another item is already called "${clash.name}".` });

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      parsed,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    res.json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json({ message: 'Item deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
