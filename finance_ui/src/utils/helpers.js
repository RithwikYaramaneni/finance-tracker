import dayjs from 'dayjs';

export const monthKeyFromDate = (date = new Date()) => dayjs(date).format('YYYY-MM');

export const formatMonthLabel = (monthKey) => 
  monthKey ? dayjs(`${monthKey}-01`).format('MMMM YYYY') : '';

export const createDefaultFilters = (monthKey = monthKeyFromDate()) => {
  const start = dayjs(`${monthKey}-01`).startOf('month');
  const end = dayjs(`${monthKey}-01`).endOf('month');
  return {
    from: start.format('YYYY-MM-DD'),
    to: end.format('YYYY-MM-DD'),
    category: '',
    type: '',
    minAmount: '',
    maxAmount: '',
    q: ''
  };
};

export const getTotals = (transactions) => {
  let income = 0, expense = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
  }
  return { income, expense, net: income - expense };
};

export const formatINR = (amount = 0) => {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2
  });
};
