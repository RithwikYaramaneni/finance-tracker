import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { API_URL, PIE_COLORS } from '../utils/constants';
import { formatMonthLabel, formatINR } from '../utils/helpers';

const ReportsPage = ({ selectedMonth, setSelectedMonth, pushToast }) => {
  const [reportBundle, setReportBundle] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async (monthKey = selectedMonth) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/reports/monthly`, { params: { month: monthKey } });
      if (res.data.success) {
        setReportBundle(res.data.data);
      }
    } catch (error) {
      pushToast('Unable to load reports', 'error');
      setReportBundle(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/transactions`);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (error) {
      console.error('Unable to load transactions');
    }
  };

  useEffect(() => {
    fetchReports(selectedMonth);
    fetchTransactions();
  }, [selectedMonth]);

  // Normalize backend report shapes into UI-friendly datasets
  const monthlyReport = reportBundle?.report;
  const pieData = useMemo(() => {
    const breakdown = reportBundle?.categoryBreakdown?.data || [];
    return breakdown.map((item) => ({ name: item.category, value: item.total }));
  }, [reportBundle]);

  const barData = useMemo(() => {
    const trend = reportBundle?.trend || [];
    // trend entries: { monthKey: 'YYYY-MM', income, expense }
    return trend.map((t) => ({ month: t.monthKey, totalSpent: t.expense }));
  }, [reportBundle]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    transactions.forEach((txn) => {
      if (txn.type === 'expense') {
        totals[txn.category] = (totals[txn.category] || 0) + txn.amount;
      }
    });
    return Object.entries(totals)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div style={styles.container}>
      <section style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3>Monthly Report</h3>
          <span style={{ color: '#6b7280' }}>{formatMonthLabel(selectedMonth)}</span>
        </div>
        {loading ? (
          <p>Loading report...</p>
        ) : monthlyReport ? (
          <div>
            {/* Income/Expense Totals */}
            {reportBundle?.totals && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                marginBottom: 16
              }}>
                <div style={styles.reportItem}>
                  <span>Income</span>
                  <strong>{formatINR(reportBundle.totals.income)}</strong>
                </div>
                <div style={styles.reportItem}>
                  <span>Expense</span>
                  <strong>{formatINR(reportBundle.totals.expense)}</strong>
                </div>
                <div style={styles.reportItem}>
                  <span>Net</span>
                  <strong>{formatINR(reportBundle.totals.net)}</strong>
                </div>
              </div>
            )}
            <div style={styles.reportSummary}>
              <div style={styles.reportItem}>
                <span>Total Spent</span>
                <strong>{formatINR(monthlyReport.totalSpent)}</strong>
              </div>
              <div style={styles.reportItem}>
                <span>Overspent Categories</span>
                <ul style={styles.listReset}>
                  {monthlyReport.overspent?.length ? (
                    monthlyReport.overspent.map((item) => (
                      <li key={item.category}>
                        {item.category} · {formatINR(item.spent - item.budget)} over
                      </li>
                    ))
                  ) : (
                    // Fallback: show top 3 spending categories when there are no budgets or overspends
                    (monthlyReport.totalsPerCategory || []).slice(0, 3).map((t) => (
                      <li key={t.category}>{t.category} · {formatINR(t.total)} spent</li>
                    ))
                  )}
                </ul>
              </div>
              <div style={styles.reportItem}>
                <span>Savings</span>
                <ul style={styles.listReset}>
                  {monthlyReport.saved?.length ? (
                    monthlyReport.saved.slice(0, 3).map((item) => (
                      <li key={item.category}>
                        {item.category} · {formatINR(item.budget - item.spent)} saved
                      </li>
                    ))
                  ) : (
                    // Fallback: use month-over-month reductions when budgets are absent
                    monthlyReport.monthOverMonthSavings?.length ? (
                      monthlyReport.monthOverMonthSavings.slice(0, 3).map((s) => (
                        <li key={s.category}>
                          {s.category} · {formatINR(s.savedAmount)} lower vs last month
                        </li>
                      ))
                    ) : (
                      <li>No savings identified</li>
                    )
                  )}
                </ul>
              </div>
              <div style={styles.reportItem}>
                <span>Biggest Improvement</span>
                {monthlyReport.cutDown ? (
                  <p>
                    {monthlyReport.cutDown.category}: {formatINR(monthlyReport.cutDown.difference)} lower vs last month
                  </p>
                ) : (
                  <p>No reduction compared to last month.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p style={styles.noteText}>Add transactions to generate reports.</p>
        )}
      </section>

      <section style={styles.sectionCard}>
        <h3 style={{ marginBottom: 16 }}>Expense Breakdown by Category</h3>
        {pieData.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatINR(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p style={styles.noteText}>No expense data for pie chart yet.</p>
        )}
      </section>

      <section style={styles.sectionCard}>
        <h3 style={{ marginBottom: 16 }}>Month-over-Month Spending</h3>
        {barData.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatINR(value)} />
              <Legend />
              <Bar dataKey="totalSpent" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={styles.noteText}>Add more transactions to see month-over-month trends.</p>
        )}
      </section>

      <section style={styles.sectionCard}>
        <h3 style={{ marginBottom: 16 }}>All-Time Category Totals</h3>
        {categoryTotals.length ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.tableCell}>Category</th>
                  <th style={styles.tableCell}>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map((item, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.tableCell}>{item.category}</td>
                    <td style={styles.tableCell}>{formatINR(item.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={styles.noteText}>No expense data available.</p>
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12
  },
  reportSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16
  },
  reportItem: {
    background: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
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
  noteText: {
    color: '#6b7280',
    fontStyle: 'italic'
  }
};

export default ReportsPage;
