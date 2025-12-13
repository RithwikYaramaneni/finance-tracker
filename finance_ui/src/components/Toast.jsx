import React from 'react';

// Toast component supports two modes:
// 1) Single toast: pass { message, type, onDismiss }
// 2) Stack of toasts: pass { toasts: [{ id, message, type }], dismiss(id) }
const Toast = ({ toasts, dismiss, message, type = 'success', onDismiss }) => {
  const styles = {
    toastStack: {
      position: 'fixed',
      top: 80,
      right: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      zIndex: 1000
    },
    toast: {
      background: '#fff',
      padding: '12px 16px',
      borderRadius: 12,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      minWidth: 300,
      maxWidth: 400,
      borderLeft: '4px solid'
    },
    toastClose: {
      border: 'none',
      background: 'transparent',
      fontSize: 20,
      cursor: 'pointer',
      color: '#6b7280',
      padding: 4
    }
  };

  // If single toast props are provided, render just one toast and exit.
  if (typeof message === 'string' && message.length > 0) {
    return (
      <div style={styles.toastStack}>
        <div
          style={{
            ...styles.toast,
            borderLeftColor: type === 'error' ? '#e03131' : '#06a77d'
          }}
        >
          <span>{message}</span>
          <button onClick={onDismiss} style={styles.toastClose}>×</button>
        </div>
      </div>
    );
  }

  // Otherwise, render a stack if an array of toasts is provided.
  const list = Array.isArray(toasts) ? toasts : [];
  if (list.length === 0) return null;

  return (
    <div style={styles.toastStack}>
      {list.map((toast) => (
        <div
          key={toast.id}
          style={{
            ...styles.toast,
            borderLeftColor: toast.type === 'error' ? '#e03131' : '#06a77d'
          }}
        >
          <span>{toast.message}</span>
          <button onClick={() => dismiss?.(toast.id)} style={styles.toastClose}>×</button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
