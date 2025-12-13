import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { formatINR } from '../utils/helpers';

const InsightsPage = ({ pushToast }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/insights`);
      if (res.data.success) {
        setInsights(res.data.data);
      }
    } catch (error) {
      pushToast('Unable to load insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const renderList = (items, emptyText, renderItem) => {
    if (!items || !items.length) {
      return <p style={styles.noteText}>{emptyText}</p>;
    }
    return (
      <ul style={styles.listReset}>
        {items.map((item, idx) => (
          <li key={idx} style={styles.insightItem}>
            {renderItem ? renderItem(item) : (
              <span>
                <strong>{item.category}</strong>: {formatINR(item.amount || item.total || 0)}
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={styles.container}>
      <section style={styles.sectionCard}>
        <h2 style={{ marginBottom: 8 }}>Smart Insights</h2>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>
          AI-like recommendations to help you manage your finances better.
        </p>
        {loading ? (
          <p>Loading insights...</p>
        ) : insights ? (
          <div style={styles.insightGrid}>
            <div style={styles.insightCard}>
              <h4>Unusual Expenses</h4>
              {renderList(
                insights.anomalies,
                'No unusual spending detected.',
                (item) => (
                  <span>
                    {item.message}
                    {item.details ? (
                      <span style={{ color: '#6b7280' }}>
                        {' '}
                        (Current: {formatINR(item.details.current)}, Baseline: {formatINR(item.details.baseline)})
                      </span>
                    ) : null}
                  </span>
                )
              )}
            </div>
            <div style={styles.insightCard}>
              <h4>Consistent Spenders</h4>
              {renderList(
                insights.recurring,
                'No recurring patterns found yet.',
                (item) => (
                  <span>
                    <strong>{item.merchant}</strong> · {formatINR(item.avgAmount)} every ~{item.frequencyDays} days
                  </span>
                )
              )}
            </div>
            <div style={styles.insightCard}>
              <h4>Category Suggestions</h4>
              {renderList(
                insights.categorySuggestions,
                'No suggestions available.',
                (item) => (
                  <span>
                    <strong>{item.description}</strong> → Suggest: {item.suggestedCategory}
                  </span>
                )
              )}
            </div>
            <div style={styles.insightCard}>
              <h4>Monthly Explanations</h4>
              {renderList(
                insights.explanations,
                'No significant increases detected.',
                (item) => (
                  <span>
                    <strong>{item.category}</strong>: {item.message} (+{formatINR(item.delta)})
                  </span>
                )
              )}
            </div>
            <div style={styles.insightCard}>
              <h4>Average Monthly Spending</h4>
              {insights.averageMonthlySpend != null ? (
                <p style={{ fontSize: 18, fontWeight: 600 }}>{formatINR(insights.averageMonthlySpend)}</p>
              ) : (
                <p style={styles.noteText}>Add more data to see your average.</p>
              )}
            </div>
            {/* Recommendation card removed per user request */}
          </div>
        ) : (
          <p style={styles.noteText}>Add transactions and budgets to get personalized insights.</p>
        )}
      </section>

      <section style={styles.sectionCard}>
        <h3 style={{ marginBottom: 16 }}>Insight Methodology</h3>
        <div style={styles.methodologyBox}>
          <p>
            <strong>Top Spending Categories:</strong> Shows the top 5 categories where you spend the most across all time.
          </p>
          <p>
            <strong>Savings Opportunities:</strong> Identifies categories where you spend significantly below your budget, suggesting you can reallocate or save more.
          </p>
          <p>
            <strong>Unusual Expenses:</strong> Highlights categories with spending spikes (over 30% above average) to help you notice irregular costs.
          </p>
          <p>
            <strong>Consistent Spenders:</strong> Categories where your monthly spending stays stable, indicating recurring expenses.
          </p>
          <p>
            <strong>Average Monthly Spending:</strong> Your overall average spend per month, calculated from all transactions.
          </p>
          <p>
            <strong>Recommendation:</strong> Personalized AI-like suggestion based on your spending patterns and budgets.
          </p>
        </div>
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
  insightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16
  },
  insightCard: {
    background: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderLeft: '4px solid #0f172a'
  },
  listReset: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 14,
    marginTop: 8
  },
  insightItem: {
    padding: '8px 12px',
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e5e7eb'
  },
  methodologyBox: {
    background: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    color: '#1e3a8a'
  },
  noteText: {
    color: '#6b7280',
    fontStyle: 'italic'
  }
};

export default InsightsPage;
