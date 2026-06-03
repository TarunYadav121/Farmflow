import { Component } from 'react';


class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    // In a real app you would send this to a logging service
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrap}>
          <div style={styles.box}>
            <span style={styles.icon}>⚠️</span>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.msg}>{this.state.message}</p>
            <button
              style={styles.btn}
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.href = '/';
              }}
            >
              Go back to home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  wrap:  { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box:   { background: '#fff', border: '1px solid #ffcdd2', borderRadius: 10, padding: '40px 32px', maxWidth: 440, width: '100%', textAlign: 'center' },
  icon:  { fontSize: '2.5rem', display: 'block', marginBottom: 12 },
  title: { color: '#c62828', marginBottom: 10, fontSize: '1.2rem' },
  msg:   { color: '#555', fontSize: '0.9rem', marginBottom: 24, wordBreak: 'break-word' },
  btn:   { background: '#2e7d32', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontSize: '0.92rem' },
};

export default ErrorBoundary;
