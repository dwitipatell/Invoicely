import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    nameKey: { type: String, required: true }, // lowercase name, for case-insensitive matching
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

// Each account can have its own "banana", but no duplicates inside one account
itemSchema.index({ owner: 1, nameKey: 1 }, { unique: true });

export default mongoose.model('Item', itemSchema);
