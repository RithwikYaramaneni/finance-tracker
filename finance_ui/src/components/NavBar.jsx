import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Transactions', icon: '💳' },
    { path: '/overview', label: 'Overview', icon: '📊' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/insights', label: 'Insights', icon: '💡' }
  ];

  const styles = {
    nav: {
      background: '#fff',
      borderBottom: '2px solid #e5e7eb',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    container: {
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 64
    },
    brand: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      textDecoration: 'none'
    },
    brandIcon: {
      fontSize: 32
    },
    brandText: {
      fontSize: 24,
      fontWeight: 700,
      color: '#111827',
      margin: 0
    },
    navList: {
      display: 'flex',
      gap: 8,
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 20px',
      borderRadius: 8,
      textDecoration: 'none',
      color: '#6b7280',
      fontWeight: 600,
      fontSize: 15,
      transition: 'all 0.2s ease'
    },
    navLinkActive: {
      background: '#111827',
      color: '#fff'
    },
    navLinkHover: {
      background: '#f3f4f6',
      color: '#111827'
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>💰</span>
          <h1 style={styles.brandText}>Finance Tracker</h1>
        </Link>
        <ul style={styles.navList}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      Object.assign(e.target.style, styles.navLinkHover);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#6b7280';
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
