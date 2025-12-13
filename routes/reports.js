const express = require('express');
const {
  aggregateByCategory,
  getMonthlyReport,
  getTrendSeries,
  getCashflowCalendar,
  getIncomeExpenseTotals
} = require('../services/analyticsService');

const router = express.Router();

router.get('/monthly', async (req, res) => {
  try {
    const monthKey = req.query.month;
    const [report, categoryBreakdown, trend, cashflow, totals] = await Promise.all([
      getMonthlyReport(monthKey),
      aggregateByCategory({ monthKey, type: 'expense' }),
      getTrendSeries(6),
      getCashflowCalendar(monthKey),
      getIncomeExpenseTotals(monthKey)
    ]);

    res.status(200).json({
      success: true,
      data: {
        report,
        categoryBreakdown,
        trend,
        cashflow,
        totals
      },
      message: 'Monthly report generated'
    });
  } catch (error) {
    console.error('Monthly report error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
});

module.exports = router;
