import { useState } from 'react';
import { api } from '../api';
import Notice from './Notice';

const emptyForm = { name: '', rate: '', quantity: '' };

export default function AddItem() {
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { item, created } = await api.saveItem({
        name: form.name,
        rate: parseFloat(form.rate),
        quantity: parseInt(form.quantity, 10),
      });
      setNotice({
        type: 'success',
        text: created
          ? `"${item.name}" added to inventory.`
          : `"${item.name}" restocked. New quantity: ${item.quantity}.`,
      });
      setForm(emptyForm);
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h2>Add or restock an item</h2>
      <form className="stack" onSubmit={handleSubmit}>
        <input name="name" placeholder="Item name" value={form.name} onChange={handleChange} required />
        <input name="rate" type="number" min="0.01" step="0.01" placeholder="Rate per item (₹)"
          value={form.rate} onChange={handleChange} required />
        <input name="quantity" type="number" min="0" step="1" placeholder="Quantity"
          value={form.quantity} onChange={handleChange} required />
        <button className="primary" disabled={busy}>Save item</button>
      </form>
      <Notice notice={notice} />
    </div>
  );
}
