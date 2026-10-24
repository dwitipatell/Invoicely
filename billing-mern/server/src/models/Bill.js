import mongoose from 'mongoose';

const lineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rate: { type: Number, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true }, // rate × quantity, saved as a snapshot
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    customerName: { type: String, default: 'Walk-in customer', trim: true },
    lines: { type: [lineSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true }, // Σ amount
    taxRate: { type: Number, required: true },  // GST % at the time of sale
    taxAmount: { type: Number, required: true }, // subtotal × taxRate / 100
    total: { type: Number, required: true },    // subtotal + taxAmount
  },
  { timestamps: true }
);

export default mongoose.model('Bill', billSchema);
