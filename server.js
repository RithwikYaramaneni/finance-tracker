const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const reportRoutes = require('./routes/reports');
const insightRoutes = require('./routes/insights');
const alertRoutes = require('./routes/alerts');

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/finance-tracker';
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'OK', message: 'Server is running' });
});

const start = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server', error);
    process.exit(1);
  }
};

start();
module.exports = app;