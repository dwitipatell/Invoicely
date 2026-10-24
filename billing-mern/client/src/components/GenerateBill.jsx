import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { money, round2 } from '../format';
import Notice from './Notice';
import Invoice from './Invoice';

export default function GenerateBill() {
  const [inventory, setInventory] = useState([]);
  const [taxRate, setTaxRate] = useState(0);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [selected, setSelected] = useState('');
  const [qty, setQty] = useState('');
  const [notice, setNotice] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const loadData = () =>
    Promise.all([api.getItems(), api.getDashboard()])
      .then(([items, dash]) => {
        setInventory(items);
        setTaxRate(dash.taxRate);
      })
      .catch((err) => setNotice({ type: 'error', text: err.message }));

  useEffect(() => { loadData(); }, []);

  // subtotal = Σ (rate × quantity)
  const subtotal = useMemo(
    () => round2(cart.reduce((sum, l) => sum + l.rate * l.quantity, 0)),
    [cart]
  );
  // taxAmount = subtotal × taxRate / 100
  const taxAmount = round2((subtotal * taxRate) / 100);
  // total = subtotal + taxAmount
  const total = round2(subtotal + taxAmount);

  function addToCart(e) {
    e.preventDefault();
    const item = inventory.find((i) => i.nameKey === selected);
    const quantity = parseInt(qty, 10);

    if (!item) {
      setNotice({ type: 'error', text: 'Please select an item.' });
      return;
    }

    // Quantity already in cart + new quantity must fit in stock
    const inCart = cart.find((l) => l.nameKey === item.nameKey)?.quantity ?? 0;
    if (inCart + quantity > item.quantity) {
      setNotice({ type: 'error', text: `Only ${item.quantity - inCart} more of ${item.name} available.` });
      return;
    }

    setCart((prev) => {
      const exists = prev.some((l) => l.nameKey === item.nameKey);
      return exists
        ? prev.map((l) => (l.nameKey === item.nameKey ? { ...l, quantity: l.quantity + quantity } : l))
        : [...prev, { nameKey: item.nameKey, name: item.name, rate: item.rate, quantity }];
    });

    setNotice({ type: 'success', text: `Added ${quantity} × ${item.name}.` });
    setSelected('');
    setQty('');
  }

  async function checkout() {
    if (cart.length === 0) {
      setNotice({ type: 'error', text: 'The bill is empty. Add items before checkout.' });
      return;
    }
    try {
      const bill = await api.checkout({
        customerName,
        items: cart.map(({ name, quantity }) => ({ name, quantity })),
      });
      setInvoice(bill);
      setCart([]);
      setCustomerName('');
      setNotice({ type: 'success', text: `Bill ${bill.invoiceNo} saved.` });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
    loadData(); // refresh stock either way
  }

  const sellable = inventory.filter((i) => i.quantity > 0);

  return (
    <div className="stack">
      <h2>New bill</h2>

      <input placeholder="Customer name (optional)" value={customerName}
        onChange={(e) => setCustomerName(e.target.value)} />

      <div className="box">
        {cart.length === 0 ? (
          <p className="muted">No items yet.</p>
        ) : (
          cart.map((l) => (
            <div className="cart-line" key={l.nameKey}>
              <span>{l.name} × {l.quantity}</span>
              <span>{money(l.rate * l.quantity)}</span>
            </div>
          ))
        )}
      </div>

      <form className="row" onSubmit={addToCart}>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} required>
          <option value="">Select an item</option>
          {sellable.map((i) => (
            <option key={i._id} value={i.nameKey}>
              {i.name} ({money(i.rate)}) – {i.quantity} left
            </option>
          ))}
        </select>
        <input type="number" min="1" step="1" placeholder="Qty" value={qty}
          onChange={(e) => setQty(e.target.value)} required />
        <button className="secondary">Add</button>
      </form>

      <div className="box stack summary">
        <div className="cart-line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="cart-line"><span>GST ({taxRate}%)</span><span>{money(taxAmount)}</span></div>
        <div className="cart-line total"><span>Total</span><span>{money(total)}</span></div>
        <button className="primary" onClick={checkout}>Checkout</button>
      </div>

      <Notice notice={notice} />
      {invoice && <Invoice bill={invoice} onClose={() => setInvoice(null)} />}
    </div>
  );
}
