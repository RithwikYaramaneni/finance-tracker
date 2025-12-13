import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { API_URL } from '../utils/constants';
import { monthKeyFromDate, createDefaultFilters, formatINR, getTotals } from '../utils/helpers';

const TransactionsPage = ({ selectedMonth, setSelectedMonth, pushToast }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, date: '', amount: '', category: '', type: 'expense' });
  const [filters, setFilters] = useState(createDefaultFilters());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totals = useMemo(() => getTotals(transactions), [transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/transactions`);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (error) {
      pushToast('Unable to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.date || !form.amount || Number(form.amount) <= 0 || !form.category.trim() || !form.type) {
      pushToast('Please fill all fields correctly', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (form.id) {
        const res = await axios.put(`${API_URL}/api/transactions/${form.id}`, {
          date: form.date,
          amount: Number(form.amount),
          category: form.category,
          type: form.type
        });
        if (res.data?.success) {
          pushToast('Transaction updated');
          setForm({ id: null, date: '', amount: '', category: '', type: 'expense' });
          await fetchTransactions();
        } else {
          pushToast(res.data?.message || 'Failed to update transaction', 'error');
        }
      } else {
        const res = await axios.post(`${API_URL}/api/transactions`, {
          date: form.date,
          amount: Number(form.amount),
          category: form.category,
          type: form.type
        });
        if (res.data?.success) {
          pushToast('Transaction added');
          setForm({ id: null, date: '', amount: '', category: '', type: 'expense' });
          await fetchTransactions();
        } else {
          pushToast(res.data?.message || 'Failed to add transaction', 'error');
        }
      }
    } catch (error) {
      console.error('Transaction save error:', error);
      pushToast(
        error.response?.data?.message || error.response?.data?.error || 'Unable to save transaction',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (txn) => {
    setForm({ id: txn._id, date: txn.date, amount: txn.amount, category: txn.category, type: txn.type });
  };

  const handleDelete = async (id) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await axios.delete(`${API_URL}/api/transactions/${id}`);
      if (res.data?.success) {
        // Suppress success alert per user preference
        await fetchTransactions();
      } else {
        pushToast(res.data?.message || 'Unable to delete transaction', 'error');
      }
    } catch (error) {
      console.error('Transaction delete error:', error);
      pushToast('Unable to delete transaction', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (filters.monthKey && filters.monthKey !== 'all') {
      result = result.filter((txn) => monthKeyFromDate(txn.date) === filters.monthKey);
    }

    if (filters.type && filters.type !== 'all') {
      result = result.filter((txn) => txn.type === filters.type);
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter((txn) => txn.category === filters.category);
    }

    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    return result;
  }, [transactions, filters]);

  const uniqueMonths = useMemo(() => {
    const monthsSet = new Set();
    transactions.forEach((txn) => {
      monthsSet.add(monthKeyFromDate(txn.date));
    });
    const sorted = Array.from(monthsSet).sort().reverse();
    return sorted;
  }, [transactions]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    transactions.forEach((txn) => cats.add(txn.category));
    return Array.from(cats).sort();
  }, [transactions]);

  return (
    <div style={styles.container}>
      <section style={styles.sectionCard}>
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span>Income</span>
            <strong style={{ color: '#06a77d' }}>{formatINR(totals.income)}</strong>
          </div>
          <div style={styles.statCard}>
            <span>Expense</span>
            <strong style={{ color: '#e84a5f' }}>{formatINR(totals.expense)}</strong>
          </div>
          <div style={styles.statCard}>
            <span>Net Balance</span>
            <strong style={{ color: totals.net >= 0 ? '#06a77d' : '#e84a5f' }}>
              {formatINR(totals.net)}
            </strong>
          </div>
        </div>
      </section>

      <section style={styles.sectionCard}>
        <h3 style={{ marginBottom: 16 }}>Add / Update Transaction</h3>
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            style={styles.input}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Category (e.g. Groceries)"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            style={styles.input}
            required
          />
          <select
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            style={styles.input}
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <button type="submit" style={styles.button}>
            {form.id ? 'Update' : 'Add'} Transaction
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm({ id: null, date: '', amount: '', category: '', type: 'expense' })}
              style={styles.subtleButton}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <section style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3>All Transactions</h3>
          <span style={{ color: '#6b7280' }}>
            {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={styles.filterRow}>
          <select
            value={filters.monthKey}
            onChange={(e) => setFilters((prev) => ({ ...prev, monthKey: e.target.value }))}
            style={styles.input}
          >
            <option value="all">All Months</option>
            {uniqueMonths.map((mk) => (
              <option key={mk} value={mk}>
                {dayjs(mk + '-01').format('MMMM YYYY')}
              </option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            style={styles.input}
          >
            <option value="all">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            style={styles.input}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <p>Loading transactions...</p>
        ) : filteredTransactions.length ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.tableCell}>Date</th>
                  <th style={styles.tableCell}>Category</th>
                  <th style={styles.tableCell}>Type</th>
                  <th style={styles.tableCell}>Amount</th>
                  <th style={styles.tableCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{dayjs(txn.date).format('MMM DD, YYYY')}</td>
                    <td style={styles.tableCell}>{txn.category}</td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.typePill,
                          background: txn.type === 'income' ? '#d1fae5' : '#fee2e2',
                          color: txn.type === 'income' ? '#065f46' : '#991b1b'
                        }}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td style={{ ...styles.tableCell, fontWeight: 600 }}>
                      {formatINR(txn.amount)}
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button onClick={() => handleEdit(txn)} style={styles.subtleButton} disabled={isSubmitting}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(txn._id)} style={styles.subtleButton} disabled={isSubmitting}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={styles.noteText}>No transactions found. Start adding transactions!</p>
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  },
  sectionCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '20px 24px',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16
  },
  statCard: {
    background: '#f9fafb',
    borderRadius: 12,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    color: '#111827'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 16
  },
  input: {
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    flex: 1,
    minWidth: 0
  },
  button: {
    border: 'none',
    borderRadius: 8,
    background: '#0f172a',
    color: '#fff',
    padding: '10px 16px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  subtleButton: {
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '8px 14px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHead: {
    background: '#f9fafb',
    fontWeight: 600
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  tableCell: {
    padding: '12px 16px',
    textAlign: 'left'
  },
  actionButtons: {
    display: 'flex',
    gap: 8
  },
  typePill: {
    padding: '4px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600
  },
  noteText: {
    color: '#6b7280',
    fontStyle: 'italic'
  }
};

export default TransactionsPage;
