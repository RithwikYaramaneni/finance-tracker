const express = require('express');
const Budget = require('../models/Budget');
const { MONTH_KEY_FORMAT, getMonthKey } = require('../utils/dateHelpers');
const { getBudgetsWithProgress } = require('../services/analyticsService');

const router = express.Router();

const resolveMonth = (monthKey) => {
  if (monthKey && MONTH_KEY_FORMAT.test(monthKey)) return monthKey;
  return getMonthKey();
};

router.get('/', async (req, res) => {
  try {
    const data = await getBudgetsWithProgress(req.query.month);
    res.status(200).json({ success: true, data, message: 'Budgets retrieved successfully' });
  } catch (error) {
    console.error('Get budgets error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to retrieve budgets', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {
      category: req.body.category,
      amount: req.body.amount,
      monthKey: resolveMonth(req.body.monthKey)
    };
    const budget = await Budget.create(payload);
    const data = await getBudgetsWithProgress(payload.monthKey);
    res.status(201).json({ success: true, data, budget, message: 'Budget created successfully' });
  } catch (error) {
    console.error('Create budget error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: `Budget for "${req.body.category}" already exists for this month`,
        error: 'Duplicate budget entry' 
      });
    }
    res.status(400).json({ success: false, message: 'Failed to create budget', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const monthKey = resolveMonth(req.body.monthKey || req.body.month);
    const updated = await Budget.findByIdAndUpdate(
      req.params.id,
      {
        category: req.body.category,
        amount: req.body.amount,
        monthKey
      },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    const data = await getBudgetsWithProgress(monthKey);
    res.status(200).json({ success: true, data, budget: updated, message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Update budget error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: `Budget for "${req.body.category}" already exists for this month`,
        error: 'Duplicate budget entry' 
      });
    }
    res.status(400).json({ success: false, message: 'Failed to update budget', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Budget.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    const data = await getBudgetsWithProgress(deleted.monthKey);
    res.status(200).json({ success: true, data, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to delete budget', error: error.message });
  }
});

module.exports = router;
