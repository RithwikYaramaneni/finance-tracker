import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h3>Something went wrong.</h3>
          <p style={{ color: '#6b7280' }}>Try refreshing the page. If it persists, check the console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
