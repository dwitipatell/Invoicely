import { useEffect, useState } from 'react';
import { api } from '../api';
import { money } from '../format';
import Notice from './Notice';

function StockBadge({ quantity, threshold }) {
  if (quantity === 0) return <span className="badge out">Out of stock</span>;
  if (quantity <= threshold) return <span className="badge low">Low stock</span>;
  return <span className="badge ok">In stock</span>;
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [threshold, setThreshold] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', rate: '', quantity: '' });
  const [notice, setNotice] = useState(null);

  const load = () =>
    Promise.all([api.getItems(), api.getDashboard()])
      .then(([list, dash]) => {
        setItems(list);
        setThreshold(dash.lowStockThreshold);
      })
      .catch((err) => setNotice({ type: 'error', text: err.message }));

  useEffect(() => { load(); }, []);

  function startEdit(item) {
    setEditingId(item._id);
    setDraft({ name: item.name, rate: item.rate, quantity: item.quantity });
    setNotice(null);
  }

  async function saveEdit(id) {
    try {
      await api.updateItem(id, {
        name: draft.name,
        rate: parseFloat(draft.rate),
        quantity: parseInt(draft.quantity, 10),
      });
      setEditingId(null);
      setNotice({ type: 'success', text: 'Item updated.' });
      load();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.name}" from inventory?`)) return;
    try {
      await api.deleteItem(item._id);
      setNotice({ type: 'success', text: `"${item.name}" deleted.` });
      load();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="stack">
      <h2>Inventory</h2>
      <Notice notice={notice} />
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Rate</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan="5" className="muted">No items in inventory.</td></tr>
          )}
          {items.map((item) =>
            editingId === item._id ? (
              <tr key={item._id}>
                <td>
                  <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </td>
                <td>
                  <input type="number" min="0.01" step="0.01" value={draft.rate}
                    onChange={(e) => setDraft({ ...draft, rate: e.target.value })} />
                </td>
                <td>
                  <input type="number" min="0" step="1" value={draft.quantity}
                    onChange={(e) => setDraft({ ...draft, quantity: e.target.value })} />
                </td>
                <td></td>
                <td className="actions">
                  <button className="primary small" onClick={() => saveEdit(item._id)}>Save</button>
                  <button className="secondary small" onClick={() => setEditingId(null)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{money(item.rate)}</td>
                <td>{item.quantity}</td>
                <td><StockBadge quantity={item.quantity} threshold={threshold} /></td>
                <td className="actions">
                  <button className="secondary small" onClick={() => startEdit(item)}>Edit</button>
                  <button className="secondary small danger" onClick={() => remove(item)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
