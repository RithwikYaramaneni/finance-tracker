const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
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
  description: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

transactionSchema.index({ date: -1 });
transactionSchema.index({ categoryNormalized: 1, date: -1 });

transactionSchema.pre('validate', function transactionPreValidate(next) {
  if (this.category) {
    this.categoryNormalized = this.category.trim().toLowerCase();
  }
  next();
});

transactionSchema.pre('findOneAndUpdate', function transactionPreUpdate(next) {
  const update = this.getUpdate();
  if (update?.category) {
    update.categoryNormalized = update.category.trim().toLowerCase();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
