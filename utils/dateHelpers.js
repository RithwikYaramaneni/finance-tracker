const MONTH_KEY_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/;

const getMonthKey = (inputDate = new Date()) => {
  const date = inputDate instanceof Date ? inputDate : new Date(inputDate);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 7);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getMonthRange = (monthKey) => {
  if (!MONTH_KEY_FORMAT.test(monthKey)) {
    throw new Error('Invalid month key format. Use YYYY-MM');
  }
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 1)
  };
};

const getPreviousMonthKey = (monthKey) => {
  if (!MONTH_KEY_FORMAT.test(monthKey)) {
    throw new Error('Invalid month key format. Use YYYY-MM');
  }
  const [yearStr, monthStr] = monthKey.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 2, 1);
  return getMonthKey(date);
};

const normalizeCategory = (value = 'Uncategorized') =>
  value && typeof value === 'string'
    ? value.trim().toLowerCase() || 'uncategorized'
    : 'uncategorized';

module.exports = {
  MONTH_KEY_FORMAT,
  getMonthKey,
  getMonthRange,
  getPreviousMonthKey,
  normalizeCategory
};
