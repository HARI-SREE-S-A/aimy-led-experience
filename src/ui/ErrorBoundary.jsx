import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("WebGL Scene Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return null or a fallback 2D background if WebGL completely fails
      return null;
    }
    return this.props.children;
  }
}
