import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("WebGL Scene Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return a visible error instead of null so we can debug "black screen" issues
      return (
        <div style={{ color: 'red', background: 'black', padding: '2rem', zIndex: 9999, position: 'relative' }}>
          <h2>WebGL Crash</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
