import { useEffect, useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GenerateBill from './components/GenerateBill';
import AddItem from './components/AddItem';
import Inventory from './components/Inventory';
import BillHistory from './components/BillHistory';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', Component: Dashboard },
  { id: 'billing', label: 'New Bill', Component: GenerateBill },
  { id: 'add-item', label: 'Add Item', Component: AddItem },
  { id: 'inventory', label: 'Inventory', Component: Inventory },
  { id: 'history', label: 'Bill History', Component: BillHistory },
];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [pageId, setPageId] = useState('dashboard');

  // api.js fires this event when the server rejects the token
  useEffect(() => {
    const onLogout = () => setToken(null);
    window.addEventListener('logout', onLogout);
    return () => window.removeEventListener('logout', onLogout);
  }, []);

  if (!token) return <Login onLogin={setToken} />;

  const Current = PAGES.find((p) => p.id === pageId).Component;

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
  }

  return (
    <div className="container">
      <header className="topbar no-print">
        <div>
          <h1>Super Market Billing</h1>
          <p className="muted">Signed in as {localStorage.getItem('username')}</p>
        </div>
        <button className="secondary" onClick={logout}>Log out</button>
      </header>

      <nav className="no-print">
        {PAGES.map((p) => (
          <button key={p.id} className={pageId === p.id ? 'active' : ''} onClick={() => setPageId(p.id)}>
            {p.label}
          </button>
        ))}
      </nav>

      <main>
        <Current />
      </main>
    </div>
  );
}
