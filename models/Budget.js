const mongoose = require('mongoose');
const { MONTH_KEY_FORMAT, normalizeCategory } = require('../utils/dateHelpers');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  categoryNormalized: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  monthKey: {
    type: String,
    required: true,
    match: MONTH_KEY_FORMAT
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

budgetSchema.index({ monthKey: 1, categoryNormalized: 1 }, { unique: true });

budgetSchema.pre('validate', function budgetPreValidate(next) {
  this.categoryNormalized = normalizeCategory(this.category);
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
