import { useEffect, useState } from 'react';
import { api } from '../api';
import { money } from '../format';
import Notice from './Notice';
import Invoice from './Invoice';

export default function BillHistory() {
  const [bills, setBills] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    api.getBills().then(setBills).catch((err) => setNotice({ type: 'error', text: err.message }));
  }, []);

  return (
    <div className="stack">
      <h2>Bill history</h2>
      <Notice notice={notice} />

      {bills.length === 0 && !notice && <p className="muted">No bills yet.</p>}

      {bills.length > 0 && (
        <table>
          <thead>
            <tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b._id}>
                <td>{b.invoiceNo}</td>
                <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                <td>{b.customerName}</td>
                <td>{money(b.total)}</td>
                <td>
                  <button className="secondary small" onClick={() => setSelected(b)}>View / Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && <Invoice bill={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
