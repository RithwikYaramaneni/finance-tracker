const express = require('express');
const { getInsights } = require('../services/insightService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await getInsights(req.query.month);
    res.status(200).json({ success: true, data, message: 'Insights generated' });
  } catch (error) {
    console.error('Insights error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to generate insights', error: error.message });
  }
});

module.exports = router;
