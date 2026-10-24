import mongoose from 'mongoose';

const lineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rate: { type: Number, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true }, // rate × quantity, stored as a snapshot
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    lines: { type: [lineSchema], validate: (v) => v.length > 0 },
    total: { type: Number, required: true }, // Σ amount
  },
  { timestamps: true }
);

export default mongoose.model('Bill', billSchema);
