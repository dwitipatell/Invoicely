# Super Market Billing System (MERN)

A MERN stack version of a supermarket billing app: manage inventory, build a bill from stock, checkout (stock is deducted), and view bill history.

Stack: MongoDB + Mongoose, Express, React (Vite), Node.js.

## Folder structure

```
billing-mern/
├── server/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/Item.js
│   │   ├── models/Bill.js
│   │   ├── routes/items.js
│   │   ├── routes/bills.js
│   │   ├── middleware/errorHandler.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   ├── components/AddItem.jsx
    │   ├── components/GenerateBill.jsx
    │   ├── components/ViewInventory.jsx
    │   ├── components/BillHistory.jsx
    │   ├── components/Notice.jsx
    │   ├── api.js
    │   ├── format.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup (step by step)

1. Install Node.js 18 or newer, and MongoDB Community Server (or create a free MongoDB Atlas cluster and copy its connection string).
2. Start MongoDB locally, or use your Atlas URI.
3. Backend:
   ```bash
   cd server
   cp .env.example .env        # on Windows: copy .env.example .env
   # edit .env and set MONGO_URI
   npm install
   npm run dev                 # runs on http://localhost:5000
   ```
4. Frontend, in a second terminal:
   ```bash
   cd client
   npm install
   npm run dev                 # runs on http://localhost:5173
   ```
5. Open http://localhost:5173. The Vite dev server proxies `/api` requests to the backend.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | /api/health | Health check |
| GET | /api/items | List all inventory items |
| POST | /api/items | Add an item, or restock it if the name already exists |
| POST | /api/bills | Checkout: validate stock, deduct it, save the bill |
| GET | /api/bills | Latest 50 bills |

## Core logic

- Restock rule: if the item name already exists (case-insensitive), the new rate replaces the old one and `quantity = oldQuantity + newQuantity`.
- Line amount: `amount = rate × quantity`
- Bill total: `total = Σ amount_i`, calculated on the server using the server's stored rates, not the rates sent by the browser.
- Checkout stock deduction uses a conditional update: `findOneAndUpdate({ nameKey, quantity: { $gte: requested } }, { $inc: { quantity: -requested } })`. If any line fails, the already-deducted lines are restored.
