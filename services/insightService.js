const Transaction = require('../models/Transaction');
const { MONTH_KEY_FORMAT, getMonthKey, getMonthRange, getPreviousMonthKey } = require('../utils/dateHelpers');

const ensureMonthKey = (monthKey) => {
  if (monthKey && MONTH_KEY_FORMAT.test(monthKey)) {
    return monthKey;
  }
  return getMonthKey();
};

const aggregateExpenseTotals = async (start, end) => {
  return Transaction.aggregate([
    {
      $match: {
        type: 'expense',
        date: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    }
  ]);
};

const buildAnomalies = async () => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const baselineStart = new Date(now);
  baselineStart.setDate(now.getDate() - 35);

  const [currentWeek, baseline] = await Promise.all([
    aggregateExpenseTotals(weekStart, now),
    aggregateExpenseTotals(baselineStart, weekStart)
  ]);

  const baselineMap = baseline.reduce((acc, item) => {
    acc[item._id] = item.total / 4; // weekly average over previous 4 weeks
    return acc;
  }, {});

  const anomalies = currentWeek
    .map((item) => {
      const avg = baselineMap[item._id] || 0;
      const ratio = avg > 0 ? item.total / avg : null;
      return {
        category: item._id,
        current: item.total,
        baseline: avg,
        ratio
      };
    })
    .filter((entry) => entry.ratio && entry.ratio >= 1.8)
    .map((entry) => ({
      message: `${entry.category} spending is ${entry.ratio.toFixed(1)}× higher than your weekly average`,
      details: {
        current: entry.current,
        baseline: entry.baseline
      }
    }));

  return anomalies;
};

const buildRecurring = async () => {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 90);
  const expenses = await Transaction.find({ type: 'expense', date: { $gte: windowStart } })
    .sort({ date: 1 })
    .lean();

  const groups = expenses.reduce((acc, tx) => {
    const key = (tx.description || '').trim().toLowerCase();
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const recurring = Object.entries(groups)
    .filter(([, txs]) => txs.length >= 3)
    .map(([merchant, txs]) => {
      const amounts = txs.map((t) => t.amount);
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const maxDiff = Math.max(...amounts) - Math.min(...amounts);
      const isConsistentAmount = avgAmount > 0 && maxDiff <= avgAmount * 0.2;

      const intervals = [];
      for (let i = 1; i < txs.length; i += 1) {
        const diff = (txs[i].date - txs[i - 1].date) / (1000 * 60 * 60 * 24);
        intervals.push(diff);
      }
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      const isRegular = intervals.every((val) => Math.abs(val - avgInterval) <= 5);

      return {
        merchant,
        avgAmount,
        frequencyDays: Math.round(avgInterval || 0),
        consistent: isConsistentAmount && isRegular,
        lastPayment: txs[txs.length - 1]?.date,
        sampleCategory: txs[0]?.category
      };
    })
    .filter((item) => item.consistent)
    .map((item) => ({
      merchant: item.merchant,
      avgAmount: item.avgAmount,
      frequencyDays: item.frequencyDays,
      lastPayment: item.lastPayment,
      category: item.sampleCategory
    }));

  return recurring.slice(0, 5);
};

const keywordCategoryMap = [
  { category: 'Food', keywords: ['swiggy', 'zomato', 'ubereats', 'restaurant', 'dine', 'cafe'] },
  { category: 'Transport', keywords: ['uber', 'ola', 'rapido', 'metro', 'fuel', 'petrol', 'diesel'] },
  { category: 'Rent', keywords: ['rent', 'landlord', 'lease'] },
  { category: 'Subscriptions', keywords: ['netflix', 'spotify', 'prime', 'youtube', 'hotstar'] },
  { category: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'mall', 'store'] },
  { category: 'Utilities', keywords: ['electricity', 'water', 'gas', 'wifi', 'internet', 'broadband'] }
];

const buildCategorySuggestions = async (monthKey) => {
  const targetMonth = ensureMonthKey(monthKey);
  const { start, end } = getMonthRange(targetMonth);
  const transactions = await Transaction.find({ date: { $gte: start, $lt: end } })
    .sort({ date: -1 })
    .limit(50)
    .lean();

  const suggestions = [];
  transactions.forEach((tx) => {
    const description = (tx.description || '').toLowerCase();
    if (!description) return;
    keywordCategoryMap.forEach(({ category, keywords }) => {
      if (keywords.some((keyword) => description.includes(keyword))) {
        suggestions.push({
          transactionId: tx._id,
          description: tx.description,
          suggestedCategory: category
        });
      }
    });
  });

  return suggestions.slice(0, 10);
};

const buildExplanationCards = async (monthKey) => {
  const targetMonth = ensureMonthKey(monthKey);
  const previousMonthKey = getPreviousMonthKey(targetMonth);
  const { start: currentStart, end: currentEnd } = getMonthRange(targetMonth);
  const { start: prevStart, end: prevEnd } = getMonthRange(previousMonthKey);

  const [current, previous] = await Promise.all([
    aggregateExpenseTotals(currentStart, currentEnd),
    aggregateExpenseTotals(prevStart, prevEnd)
  ]);

  const prevMap = previous.reduce((acc, entry) => {
    acc[entry._id] = entry.total;
    return acc;
  }, {});

  const explanations = current
    .map((entry) => {
      const prevTotal = prevMap[entry._id] || 0;
      const difference = entry.total - prevTotal;
      return { category: entry._id, current: entry.total, previous: prevTotal, difference };
    })
    .filter((entry) => entry.difference > 0)
    .sort((a, b) => b.difference - a.difference)
    .slice(0, 4)
    .map((entry) => ({
      category: entry.category,
      message: `${entry.category} drove most of the increase this month`,
      delta: entry.difference,
      current: entry.current,
      previous: entry.previous
    }));

  return explanations;
};

const getInsights = async (monthKey) => {
  const targetMonth = ensureMonthKey(monthKey);
  const [anomalies, recurring, suggestions, explanations] = await Promise.all([
    buildAnomalies(),
    buildRecurring(),
    buildCategorySuggestions(targetMonth),
    buildExplanationCards(targetMonth)
  ]);

  return {
    monthKey: targetMonth,
    anomalies,
    recurring,
    categorySuggestions: suggestions,
    explanations
  };
};

module.exports = {
  getInsights
};
