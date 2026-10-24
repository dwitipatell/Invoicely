# Super Market Billing System v2 (MERN)

Features
- JWT login (passwords hashed with bcrypt)
- Inventory: add, restock, edit, delete
- Low-stock and out-of-stock alerts
- Dashboard: revenue, bill count, item count, top-selling items (MongoDB aggregation)
- Billing with customer name, GST, and atomic stock deduction with rollback
- Printable invoices
- Bill history

## Run locally

Server:
    cd server
    cp .env.example .env      (edit the values)
    npm install
    npm run dev

Client, in a second terminal:
    cd client
    npm install
    npm run dev               (open http://localhost:5173)

On first start, the server creates the admin user from ADMIN_USERNAME and ADMIN_PASSWORD. After that, these two variables are ignored.

## Environment variables (server)

| Name | Purpose |
|---|---|
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Long random string used to sign login tokens |
| ADMIN_USERNAME / ADMIN_PASSWORD | First login account, created automatically |
| CLIENT_ORIGIN | Frontend URL allowed by CORS, no trailing slash |
| TAX_RATE | GST percentage, default 5 |
| LOW_STOCK_THRESHOLD | Quantity at or below which an item is low, default 5 |

## Environment variables (client)

| Name | Purpose |
|---|---|
| VITE_API_URL | Backend URL ending in /api, for example https://your-api.onrender.com/api |

## API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/login | No | Returns a JWT |
| GET | /api/items | Yes | List items |
| POST | /api/items | Yes | Add or restock an item |
| PUT | /api/items/:id | Yes | Edit an item |
| DELETE | /api/items/:id | Yes | Delete an item |
| POST | /api/bills | Yes | Checkout with GST and stock deduction |
| GET | /api/bills | Yes | Latest 50 bills |
| GET | /api/dashboard | Yes | Totals, top items, low stock |
