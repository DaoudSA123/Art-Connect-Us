import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-luxury-black text-white flex items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-denim-blue hover:bg-denim-blue-light text-white px-6 py-3 rounded transition-colors"
            >
              Reload Page
            </button>
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-gray-500">Error Details</summary>
              <pre className="mt-2 text-xs bg-gray-900 p-4 rounded overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

