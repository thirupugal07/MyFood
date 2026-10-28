import { Component } from 'react';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Swap this for Sentry / your logging service when you go live.
    console.error('[MyFood] Unhandled UI error', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="crash">
        <div className="crash__card">
          <span className="crash__emoji" aria-hidden="true">
            🍽️
          </span>
          <h1>Something went wrong</h1>
          <p>
            The kitchen dropped a plate. Reload the page and your cart and orders will still be
            there.
          </p>
          <div className="crash__actions">
            <Button onClick={this.handleReload}>Back to home</Button>
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
          {import.meta.env.DEV ? <pre className="crash__detail">{String(error?.stack || error)}</pre> : null}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
