const express = require('express');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const rent = transactions
      .filter((t) => t.category && t.category.toLowerCase() === 'rent')
      .reduce((sum, t) => sum + t.amount, 0);

    const alerts = [];
    if (totalIncome > 0 && rent > 0.5 * totalIncome) {
      alerts.push('⚠️ Rent is more than 50% of your income.');
    }

    res.status(200).json({ success: true, data: { alerts }, message: 'Alerts retrieved successfully' });
  } catch (error) {
    console.error('Get alerts error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to retrieve alerts', error: error.message });
  }
});

module.exports = router;
