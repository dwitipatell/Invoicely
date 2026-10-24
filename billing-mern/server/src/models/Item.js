import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Lowercase copy of name, used for case-insensitive matching and uniqueness
    nameKey: { type: String, required: true, unique: true, index: true },
    rate: { type: Number, required: true, min: 0.01 },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Item', itemSchema);
