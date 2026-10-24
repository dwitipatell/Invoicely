import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { money } from '../format';
import Notice from './Notice';

export default function GenerateBill() {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState('');
  const [qty, setQty] = useState('');
  const [notice, setNotice] = useState(null);

  const loadInventory = () =>
    api.getItems().then(setInventory).catch((err) => setNotice({ type: 'error', text: err.message }));

  useEffect(() => {
    loadInventory();
  }, []);

  const sellable = inventory.filter((item) => item.quantity > 0);

  // total = Σ (rate × quantity) over every cart line
  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.rate * line.quantity, 0),
    [cart]
  );

  function addToCart(e) {
    e.preventDefault();
    const item = inventory.find((i) => i.nameKey === selected);
    const quantity = parseInt(qty, 10);

    if (!item) {
      setNotice({ type: 'error', text: 'Please select an item.' });
      return;
    }

    // Check stock: what is already in the cart + what is being added must fit in inventory
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

    setNotice({ type: 'success', text: `Added ${quantity} of ${item.name} to the bill.` });
    setSelected('');
    setQty('');
  }

  async function checkout() {
    if (cart.length === 0) {
      setNotice({ type: 'error', text: 'The bill is empty. Please add items before checking out.' });
      return;
    }
    try {
      const bill = await api.checkout(cart.map(({ name, quantity }) => ({ name, quantity })));
      setCart([]);
      setNotice({ type: 'success', text: `Checkout complete. Bill total: ${money(bill.total)}.` });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
    loadInventory(); // refresh stock either way
  }

  return (
    <div className="stack">
      <h2>Generate a New Bill</h2>

      <div className="box">
        {cart.length === 0 ? (
          <p className="muted">Your bill is empty. Add some items!</p>
        ) : (
          cart.map((line) => (
            <div className="cart-line" key={line.nameKey}>
              <span>{line.name} x {line.quantity}</span>
              <span>{money(line.rate * line.quantity)}</span>
            </div>
          ))
        )}
      </div>

      <form className="row" onSubmit={addToCart}>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} required style={{ flex: 2 }}>
          <option value="">Select an item</option>
          {sellable.map((item) => (
            <option key={item._id} value={item.nameKey}>
              {item.name} ({money(item.rate)})
            </option>
          ))}
        </select>
        <input type="number" min="1" step="1" placeholder="Quantity" value={qty}
          onChange={(e) => setQty(e.target.value)} required style={{ flex: 1 }} />
        <button className="secondary">Add</button>
      </form>

      <div className="box stack">
        <div className="total">Total: {money(total)}</div>
        <button className="primary" onClick={checkout}>Checkout Bill</button>
      </div>

      <Notice notice={notice} />
    </div>
  );
}
