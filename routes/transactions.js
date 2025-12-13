const express = require('express');
const Transaction = require('../models/Transaction');

const router = express.Router();

const buildFilters = (query = {}) => {
  const filters = {};
  if (query.type && ['income', 'expense'].includes(query.type)) {
    filters.type = query.type;
  }
  if (query.category) {
    filters.categoryNormalized = query.category.trim().toLowerCase();
  }
  if (query.from || query.to) {
    filters.date = {};
    if (query.from) filters.date.$gte = new Date(query.from);
    if (query.to) filters.date.$lte = new Date(query.to);
  }
  if (query.minAmount || query.maxAmount) {
    filters.amount = {};
    if (query.minAmount) filters.amount.$gte = Number(query.minAmount);
    if (query.maxAmount) filters.amount.$lte = Number(query.maxAmount);
  }
  if (query.q) {
    const regex = new RegExp(query.q, 'i');
    filters.$or = [{ description: regex }, { category: regex }];
  }
  return filters;
};

router.get('/', async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const transactions = await Transaction.find(filters).sort({ date: -1 });
    res.status(200).json({ success: true, data: transactions, message: 'Transactions retrieved successfully' });
  } catch (error) {
    console.error('Get transactions error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to retrieve transactions', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json({ success: true, data: transaction, message: 'Transaction created successfully' });
  } catch (error) {
    console.error('Create transaction error:', error.stack);
    res.status(400).json({ success: false, message: 'Failed to create transaction', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.status(200).json({ success: true, data: updated, message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Update transaction error:', error.stack);
    res.status(400).json({ success: false, message: 'Failed to update transaction', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.status(200).json({ success: true, data: deleted, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to delete transaction', error: error.message });
  }
});

router.post('/bulk-delete', async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ success: false, message: 'ids array is required' });
  }
  try {
    await Transaction.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: { deletedIds: ids }, message: 'Transactions deleted' });
  } catch (error) {
    console.error('Bulk delete error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to delete transactions', error: error.message });
  }
});

router.post('/bulk-category', async (req, res) => {
  const { ids, category } = req.body || {};
  if (!Array.isArray(ids) || !ids.length || !category) {
    return res.status(400).json({ success: false, message: 'ids and category are required' });
  }
  try {
    const normalized = category.trim().toLowerCase();
    await Transaction.updateMany({ _id: { $in: ids } }, { category, categoryNormalized: normalized });
    const updated = await Transaction.find({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: updated, message: 'Transactions updated with new category' });
  } catch (error) {
    console.error('Bulk category error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
});

module.exports = router;
