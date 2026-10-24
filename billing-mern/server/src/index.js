import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { seedAdmin } from './config/seedAdmin.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import billRoutes from './routes/bills.js';
import dashboardRoutes from './routes/dashboard.js';
import Item from './models/Item.js';
import Bill from './models/Bill.js';
import { requireAuth } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Add it to your environment variables.');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Public: sign up and log in
app.use('/api/auth', authRoutes);

// Protected: every request needs a valid JWT
app.use('/api/items', requireAuth, itemRoutes);
app.use('/api/bills', requireAuth, billRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  // Update indexes to the per-user versions (removes the old global name index)
  .then(() => Promise.all([Item.syncIndexes(), Bill.syncIndexes()]))
  .then(seedAdmin)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
