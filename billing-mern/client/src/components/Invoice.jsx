import { money } from '../format';

// Printable invoice. Only this block prints (see print rules in index.css).
export default function Invoice({ bill, onClose }) {
  return (
    <div className="box stack invoice print-area">
      <div className="invoice-head">
        <div>
          <h2>Super Market</h2>
          <p className="muted">Tax Invoice</p>
        </div>
        <div className="right">
          <strong>{bill.invoiceNo}</strong>
          <p className="muted">{new Date(bill.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <p className="muted">Customer: {bill.customerName}</p>

      <table>
        <thead>
          <tr><th>Item</th><th>Rate</th><th>Qty</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {bill.lines.map((l, idx) => (
            <tr key={idx}>
              <td>{l.name}</td>
              <td>{money(l.rate)}</td>
              <td>{l.quantity}</td>
              <td>{money(l.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="summary">
        <div className="cart-line"><span>Subtotal</span><span>{money(bill.subtotal)}</span></div>
        <div className="cart-line"><span>GST ({bill.taxRate}%)</span><span>{money(bill.taxAmount)}</span></div>
        <div className="cart-line total"><span>Total</span><span>{money(bill.total)}</span></div>
      </div>

      <div className="actions no-print">
        <button className="primary small" onClick={() => window.print()}>Print invoice</button>
        {onClose && <button className="secondary small" onClick={onClose}>Close</button>}
      </div>
    </div>
  );
}
