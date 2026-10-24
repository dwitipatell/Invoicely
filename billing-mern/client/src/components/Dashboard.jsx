import { useEffect, useState } from 'react';
import { api } from '../api';
import { money } from '../format';
import Notice from './Notice';

function Stat({ label, value }) {
  return (
    <div className="card-stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboard().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <Notice notice={{ type: 'error', text: error }} />;
  if (!data) return <p className="muted">Loading dashboard…</p>;

  return (
    <div className="stack">
      <h2>Dashboard</h2>

      <div className="cards">
        <Stat label="Revenue (incl. GST)" value={money(data.totalRevenue)} />
        <Stat label="Bills" value={data.billCount} />
        <Stat label="Items" value={data.itemCount} />
        <Stat label="Low stock" value={data.lowStock.length} />
      </div>

      <div className="box">
        <h3>Top selling items (excl. GST)</h3>
        {data.topItems.length === 0 ? (
          <p className="muted">No sales yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Item</th><th>Sold</th><th>Sales</th></tr>
            </thead>
            <tbody>
              {data.topItems.map((t) => (
                <tr key={t.name}>
                  <td>{t.name}</td>
                  <td>{t.quantitySold}</td>
                  <td>{money(t.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="box">
        <h3>Low stock (quantity ≤ {data.lowStockThreshold})</h3>
        {data.lowStock.length === 0 ? (
          <p className="muted">All items are well stocked.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Item</th><th>Quantity left</th></tr>
            </thead>
            <tbody>
              {data.lowStock.map((i) => (
                <tr key={i._id}>
                  <td>{i.name}</td>
                  <td>{i.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
