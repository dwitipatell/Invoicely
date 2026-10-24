import { useState } from 'react';
import AddItem from './components/AddItem';
import GenerateBill from './components/GenerateBill';
import ViewInventory from './components/ViewInventory';
import BillHistory from './components/BillHistory';

const PAGES = [
  { id: 'add-item', label: 'Add Item', Component: AddItem },
  { id: 'generate-bill', label: 'Generate Bill', Component: GenerateBill },
  { id: 'view-inventory', label: 'View Inventory', Component: ViewInventory },
  { id: 'bill-history', label: 'Bill History', Component: BillHistory },
];

export default function App() {
  const [pageId, setPageId] = useState('add-item');
  const Current = PAGES.find((p) => p.id === pageId).Component;

  return (
    <div className="container">
      <header>
        <h1>Super Market Billing System</h1>
        <p className="muted">Manage your inventory and generate bills.</p>
      </header>
      <nav>
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
