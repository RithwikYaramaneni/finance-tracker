import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import OverviewPage from './pages/OverviewPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import InsightsPage from './pages/InsightsPage';
import { monthKeyFromDate } from './utils/helpers';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(monthKeyFromDate());
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Only show error toasts; suppress success/info to reduce noise
  const pushToast = (message, type = 'success') => {
    if (type !== 'error') return; // suppress non-error alerts
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  return (
    <BrowserRouter>
      <div style={styles.app}>
        <NavBar />
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast({ show: false, message: '', type: 'success' })}
          />
        )}
        <main style={styles.main}>
          <ErrorBoundary>
            <Routes>
              {/* Home defaults to Transactions */}
              <Route
                path="/"
                element={
                  <TransactionsPage
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    pushToast={pushToast}
                  />
                }
              />
              {/* Explicit alias to transactions */}
              <Route
                path="/transactions"
                element={
                  <TransactionsPage
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    pushToast={pushToast}
                  />
                }
              />
              {/* Overview route */}
              <Route
                path="/overview"
                element={
                  <OverviewPage
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    pushToast={pushToast}
                  />
                }
              />
              {/* Reports route */}
              <Route
                path="/reports"
                element={
                  <ReportsPage
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    pushToast={pushToast}
                  />
                }
              />
              {/* Insights route */}
              <Route path="/insights" element={<InsightsPage pushToast={pushToast} />} />
              {/* Fallback for unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#f8fafc'
  },
  main: {
    paddingTop: 80
  }
};

export default App;
