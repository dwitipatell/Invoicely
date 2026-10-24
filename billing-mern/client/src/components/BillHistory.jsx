import { useEffect, useState } from 'react';
import { api } from '../api';
import { money } from '../format';
import Notice from './Notice';

export default function BillHistory() {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getBills().then(setBills).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="stack">
      <h2>Bill History</h2>
      {error && <Notice notice={{ type: 'error', text: error }} />}
      {bills.length === 0 && !error && <p className="muted">No bills yet.</p>}
      {bills.map((bill) => (
        <div className="box" key={bill._id}>
          <div className="muted">{new Date(bill.createdAt).toLocaleString()}</div>
          {bill.lines.map((line, idx) => (
            <div className="cart-line" key={idx}>
              <span>{line.name} x {line.quantity}</span>
              <span>{money(line.amount)}</span>
            </div>
          ))}
          <div className="cart-line"><strong>Total</strong><strong>{money(bill.total)}</strong></div>
        </div>
      ))}
    </div>
  );
}
