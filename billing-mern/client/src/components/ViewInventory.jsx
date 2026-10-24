import { useEffect, useState } from 'react';
import { api } from '../api';
import { money } from '../format';
import Notice from './Notice';

export default function ViewInventory() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getItems().then(setItems).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="stack">
      <h2>Current Inventory</h2>
      {error && <Notice notice={{ type: 'error', text: error }} />}
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Rate</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan="3" className="muted">No items in inventory.</td></tr>
          ) : (
            items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{money(item.rate)}</td>
                <td>{item.quantity}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
