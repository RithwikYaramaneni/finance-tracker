import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_URL, STATUS_META } from '../utils/constants';
import { monthKeyFromDate, formatMonthLabel, getTotals, formatINR } from '../utils/helpers';

const OverviewPage = ({ selectedMonth, setSelectedMonth, pushToast }) => {
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [budgetsData, setBudgetsData] = useState({ monthKey: selectedMonth, budgets: [] });
  const [budgetForm, setBudgetForm] = useState({ id: null, category: '', amount: '' });
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [reportBundle, setReportBundle] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totals = useMemo(() => getTotals(transactions), [transactions]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/transactions`);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (error) {
      pushToast('Unable to load transactions', 'error');
    }
  };

  const refreshAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/alerts`);
      if (res.data.success && res.data.data) {
        setAlerts(res.data.data.alerts || []);
      }
    } catch (error) {
      setAlerts([]);
    }
  };

  const fetchBudgets = async (monthKey = selectedMonth) => {
    setBudgetLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/budgets`, { params: { month: monthKey } });
      if (res.data.success) {
        setBudgetsData(res.data.data || { monthKey, budgets: [] });
      } else {
        pushToast(res.data.message || 'Unable to load budgets', 'error');
        setBudgetsData({ monthKey, budgets: [] });
      }
    } catch (error) {
      pushToast('Unable to load budgets', 'error');
      setBudgetsData({ monthKey, budgets: [] });
    } finally {
      setBudgetLoading(false);
    }
  };

  const fetchReports = async (monthKey = selectedMonth) => {
    setReportLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/reports/monthly`, { params: { month: monthKey } });
      if (res.data.success) {
        setReportBundle(res.data.data);
      }
    } catch (error) {
      setReportBundle(null);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    refreshAlerts();
  }, []);

  useEffect(() => {
    fetchBudgets(selectedMonth);
    fetchReports(selectedMonth);
  }, [selectedMonth]);

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!budgetForm.category.trim() || !budgetForm.amount || Number(budgetForm.amount) <= 0) {
      pushToast('Provide a valid category and amount', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (budgetForm.id) {
        const res = await axios.put(`${API_URL}/api/budgets/${budgetForm.id}`, {
          category: budgetForm.category,
          amount: Number(budgetForm.amount),
          monthKey: selectedMonth
        });
        if (res.data.success) {
          pushToast('Budget updated');
          setBudgetForm({ id: null, category: '', amount: '' });
          await fetchBudgets(selectedMonth);
          await fetchReports(selectedMonth);
        }
      } else {
        const res = await axios.post(`${API_URL}/api/budgets`, {
          category: budgetForm.category,
          amount: Number(budgetForm.amount),
          monthKey: selectedMonth
        });
        if (res.data.success) {
          pushToast('Budget added');
          setBudgetForm({ id: null, category: '', amount: '' });
          await fetchBudgets(selectedMonth);
          await fetchReports(selectedMonth);
        } else {
          pushToast(res.data.message || 'Unable to save budget', 'error');
        }
      }
    } catch (error) {
      console.error('Budget save error:', error);
      pushToast(error.response?.data?.message || error.response?.data?.error || 'Unable to save budget', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startBudgetEdit = (budget) => {
    setBudgetForm({ id: budget._id, category: budget.category, amount: budget.amount });
  };

  const cancelBudgetEdit = () => {
    setBudgetForm({ id: null, category: '', amount: '' });
  };

  const handleBudgetDelete = async (id) => {
    if (isSubmitting) return;
    
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await axios.delete(`${API_URL}/api/budgets/${id}`);
      if (res.data.success) {
        pushToast('Budget deleted');
        await fetchBudgets(selectedMonth);
        await fetchReports(selectedMonth);
      } else {
        pushToast(res.data.message || 'Unable to delete budget', 'error');
      }
    } catch (error) {
      console.error('Budget delete error:', error);
      pushToast('Unable to delete budget', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBudgetCard = (budget) => {
    if (!budget || !budget._id) return null;
    
    const meta = STATUS_META[budget.status] || STATUS_META.under;
    const percentage = Math.min(budget.percentage || 0, 110);
    return (
      <div key={budget._id} style={{ ...styles.budgetCard, borderColor: meta.color }}>
        <div style={styles.budgetCardHeader}>
          <div>
            <strong>{budget.category}</strong>
            <div style={{ color: '#6c7785', fontSize: 13 }}>Limit: {formatINR(budget.amount)}</div>
          </div>
          <div style={styles.budgetActions}>
            <button type="button" onClick={() => startBudgetEdit(budget)} style={styles.subtleButton} disabled={isSubmitting}>
              Edit
            </button>
            <button type="button" onClick={() => handleBudgetDelete(budget._id)} style={styles.subtleButton} disabled={isSubmitting}>
              Delete
            </button>
          </div>
        </div>
        <div style={styles.progressRow}>
          <span style={{ fontWeight: 600 }}>{formatINR(budget.spent)}</span>
          <span style={{ color: '#8d95a3' }}>{budget.percentage}% used</span>
        </div>
        <div style={styles.progressBarTrack}>
          <div style={{ ...styles.progressBarFill, width: `${percentage}%`, background: meta.color }} />
        </div>
        <div style={{ ...styles.statusPill, color: meta.color, background: meta.background }}>
          {meta.label}
        </div>
      </div>
    );
  };

  const monthlyReport = reportBundle?.report;
  const overspent = monthlyReport?.overspent || [];
  const savings = monthlyReport?.saved || [];
  const cutDown = monthlyReport?.cutDown;

  return (
    <div style={styles.container}>
      {alerts.length > 0 && (
        <div style={styles.alertBox}>
          {alerts.map((alert, idx) => (
            <div key={idx}>{alert}</div>
          ))}
        </div>
      )}

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
        <div style={styles.sectionHeader}>
          <h3>Monthly Budgets</h3>
          <span style={{ color: '#6b7280' }}>{formatMonthLabel(selectedMonth)}</span>
        </div>
        <form style={styles.budgetForm} onSubmit={handleBudgetSubmit}>
          <input
            type="text"
            placeholder="Category"
            value={budgetForm.category}
            onChange={(e) => setBudgetForm((prev) => ({ ...prev, category: e.target.value }))}
            style={styles.input}
          />
          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={budgetForm.amount}
            onChange={(e) => setBudgetForm((prev) => ({ ...prev, amount: e.target.value }))}
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : budgetForm.id ? 'Update' : 'Save'} Budget
          </button>
          {budgetForm.id && (
            <button type="button" onClick={cancelBudgetEdit} style={styles.subtleButton} disabled={isSubmitting}>
              Cancel
            </button>
          )}
        </form>
        {budgetLoading ? (
          <p>Loading budgets...</p>
        ) : (() => {
          const safeBudgets = Array.isArray(budgetsData?.budgets)
            ? budgetsData.budgets.filter(Boolean)
            : [];
          return safeBudgets.length ? (
            <div style={styles.budgetGrid}>{safeBudgets.map((b) => renderBudgetCard(b))}</div>
          ) : (
            <p style={styles.noteText}>No budgets yet for {formatMonthLabel(selectedMonth)}.</p>
          );
        })()}
      </section>

      <section style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3>Month Summary</h3>
          <span style={{ color: '#6b7280' }}>{formatMonthLabel(monthlyReport?.monthKey || selectedMonth)}</span>
        </div>
        {reportLoading ? (
          <p>Calculating summary...</p>
        ) : monthlyReport ? (
          <div style={styles.summaryGrid}>
            <div style={styles.reportCard}>
              <small>Total Spent</small>
              <strong>{formatINR(monthlyReport.totalSpent)}</strong>
            </div>
            <div style={styles.reportCard}>
              <small>Overspent Categories</small>
              <ul style={styles.listReset}>
                {overspent.length ? (
                  overspent.map((item) => (
                    <li key={item.category}>
                      {item.category} · {formatINR(item.spent - item.budget)} over
                    </li>
                  ))
                ) : (
                  <li>None 🎉</li>
                )}
              </ul>
            </div>
            <div style={styles.reportCard}>
              <small>Savings</small>
              <ul style={styles.listReset}>
                {savings.length ? (
                  savings.slice(0, 3).map((item) => (
                    <li key={item.category}>
                      {item.category} · {formatINR(item.budget - item.spent)} saved
                    </li>
                  ))
                ) : (
                  <li>No savings yet</li>
                )}
              </ul>
            </div>
            <div style={styles.reportCard}>
              <small>Biggest Improvement</small>
              {cutDown ? (
                <p>
                  {cutDown.category}: {formatINR(cutDown.difference)} lower vs last month
                </p>
              ) : (
                <p>No reduction compared to last month.</p>
              )}
            </div>
          </div>
        ) : (
          <p style={styles.noteText}>Add transactions to generate reports.</p>
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
  alertBox: {
    padding: '12px 16px',
    borderRadius: 8,
    background: '#fffbe6',
    color: '#8d6603',
    fontWeight: 600
  },
  sectionCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '20px 24px',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12
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
  budgetForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 16
  },
  budgetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16
  },
  budgetCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '16px'
  },
  budgetCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  budgetActions: {
    display: 'flex',
    gap: 8
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    background: '#f1f5f9'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999
  },
  statusPill: {
    display: 'inline-flex',
    padding: '4px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    marginTop: 8
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
    cursor: 'pointer'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12
  },
  reportCard: {
    background: '#f9fafb',
    borderRadius: 12,
    padding: 16
  },
  listReset: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 14
  },
  noteText: {
    color: '#6b7280',
    fontStyle: 'italic'
  }
};

export default OverviewPage;
