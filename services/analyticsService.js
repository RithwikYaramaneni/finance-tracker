const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const {
  MONTH_KEY_FORMAT,
  getMonthKey,
  getMonthRange,
  getPreviousMonthKey,
  normalizeCategory
} = require('../utils/dateHelpers');

const ensureMonthKey = (monthKey) => {
  if (monthKey && MONTH_KEY_FORMAT.test(monthKey)) {
    return monthKey;
  }
  return getMonthKey();
};

const aggregateByCategory = async ({ monthKey, type = 'expense' }) => {
  const targetMonth = ensureMonthKey(monthKey);
  const { start, end } = getMonthRange(targetMonth);

  const results = await Transaction.aggregate([
    {
      $match: {
        type,
        date: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: '$category',
        categoryNormalized: { $first: '$categoryNormalized' },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { total: -1 } }
  ]);

  return {
    monthKey: targetMonth,
    data: results.map((entry) => ({
      category: entry._id,
      categoryNormalized: entry.categoryNormalized,
      total: entry.total
    }))
  };
};

const getIncomeExpenseTotals = async (monthKey) => {
  const targetMonth = ensureMonthKey(monthKey);
  const { start, end } = getMonthRange(targetMonth);

  const totals = await Transaction.aggregate([
    {
      $match: {
        date: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);

  const summary = { income: 0, expense: 0 };
  totals.forEach(({ _id, total }) => {
    if (_id === 'income') summary.income = total;
    if (_id === 'expense') summary.expense = total;
  });
  summary.net = summary.income - summary.expense;

  return { monthKey: targetMonth, ...summary };
};

const getBudgetsWithProgress = async (monthKey) => {
  const targetMonth = ensureMonthKey(monthKey);
  const [budgetDocs, expenseAggregation] = await Promise.all([
    Budget.find({ monthKey: targetMonth }).sort({ category: 1 }).lean(),
    aggregateByCategory({ monthKey: targetMonth, type: 'expense' })
  ]);

  const expenseMap = expenseAggregation.data.reduce((acc, item) => {
    acc[item.categoryNormalized] = item.total;
    return acc;
  }, {});

  const budgets = budgetDocs.map((budget) => {
    const spent = expenseMap[budget.categoryNormalized] || 0;
    const percentage = budget.amount === 0 ? 0 : Number(((spent / budget.amount) * 100).toFixed(1));
    let status = 'under';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= 80) status = 'near';

    return {
      ...budget,
      spent,
      percentage,
      status
    };
  });

  return { monthKey: targetMonth, budgets };
};

const getMonthlyReport = async (monthKey) => {
  const targetMonth = ensureMonthKey(monthKey);
  const previousMonthKey = getPreviousMonthKey(targetMonth);

  const [currentExpenses, previousExpenses, budgetsResult, totals] = await Promise.all([
    aggregateByCategory({ monthKey: targetMonth, type: 'expense' }),
    aggregateByCategory({ monthKey: previousMonthKey, type: 'expense' }),
    Budget.find({ monthKey: targetMonth }).lean(),
    getIncomeExpenseTotals(targetMonth)
  ]);

  const expenseMap = currentExpenses.data.reduce((acc, item) => {
    acc[item.categoryNormalized] = item;
    return acc;
  }, {});

  const prevExpenseMap = previousExpenses.data.reduce((acc, item) => {
    acc[item.categoryNormalized] = item;
    return acc;
  }, {});

  const budgetMap = budgetsResult.reduce((acc, budget) => {
    acc[budget.categoryNormalized] = budget;
    return acc;
  }, {});

  const overspent = [];
  const saved = [];
  Object.entries(budgetMap).forEach(([normalized, budget]) => {
    const spent = expenseMap[normalized]?.total || 0;
    if (spent > budget.amount) {
      overspent.push({ category: budget.category, budget: budget.amount, spent });
    } else {
      saved.push({ category: budget.category, budget: budget.amount, spent });
    }
  });

  const allCategories = new Set([...Object.keys(expenseMap), ...Object.keys(prevExpenseMap)]);
  let cutDown = null;
  allCategories.forEach((normalized) => {
    const prev = prevExpenseMap[normalized]?.total || 0;
    const curr = expenseMap[normalized]?.total || 0;
    const diff = prev - curr;
    if (diff > 0 && (!cutDown || diff > cutDown.difference)) {
      cutDown = {
        category: expenseMap[normalized]?.category || prevExpenseMap[normalized]?.category || 'Uncategorized',
        previousSpent: prev,
        currentSpent: curr,
        difference: diff
      };
    }
  });

  const totalSpent = currentExpenses.data.reduce((sum, item) => sum + item.total, 0);

  // Derive month-over-month savings opportunities even when budgets are not present
  // Take categories where current month spent is lower than previous month
  const monthOverMonthSavings = currentExpenses.data
    .map((entry) => {
      const prev = prevExpenseMap[entry.categoryNormalized]?.total || 0;
      const curr = entry.total || 0;
      const diff = prev - curr; // positive means reduction
      return {
        category: entry.category,
        previousSpent: prev,
        currentSpent: curr,
        savedAmount: diff
      };
    })
    .filter((e) => e.savedAmount > 0)
    .sort((a, b) => b.savedAmount - a.savedAmount)
    .slice(0, 5);

  return {
    monthKey: targetMonth,
    totalsPerCategory: currentExpenses.data,
    previousTotalsPerCategory: previousExpenses.data,
    overspent,
    saved,
    cutDown,
    totalSpent,
    totals,
    monthOverMonthSavings
  };
};

const getTrendSeries = async (monthsBack = 6) => {
  const now = new Date();
  const pipeline = [
    {
      $match: {
        date: {
          $gte: new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month' },
        buckets: {
          $push: {
            type: '$_id.type',
            total: '$total'
          }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ];

  const results = await Transaction.aggregate(pipeline);
  return results.map((entry) => {
    const monthKey = `${entry._id.year}-${String(entry._id.month).padStart(2, '0')}`;
    const income = entry.buckets.find((b) => b.type === 'income')?.total || 0;
    const expense = entry.buckets.find((b) => b.type === 'expense')?.total || 0;
    return { monthKey, income, expense };
  });
};

const getCashflowCalendar = async (monthKey) => {
  const targetMonth = ensureMonthKey(monthKey);
  const { start, end } = getMonthRange(targetMonth);

  const results = await Transaction.aggregate([
    {
      $match: {
        date: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: '$date' },
          month: { $month: '$date' },
          year: { $year: '$date' }
        },
        income: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        }
      }
    },
    { $sort: { '_id.day': 1 } }
  ]);

  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const map = results.reduce((acc, item) => {
    acc[item._id.day] = { income: item.income, expense: item.expense };
    return acc;
  }, {});

  const calendar = Array.from({ length: daysInMonth }, (_, idx) => {
    const day = idx + 1;
    const stats = map[day] || { income: 0, expense: 0 };
    return {
      day,
      income: stats.income,
      expense: stats.expense,
      net: stats.income - stats.expense
    };
  });

  return { monthKey: targetMonth, days: calendar };
};

module.exports = {
  aggregateByCategory,
  getIncomeExpenseTotals,
  getBudgetsWithProgress,
  getMonthlyReport,
  getTrendSeries,
  getCashflowCalendar
};
