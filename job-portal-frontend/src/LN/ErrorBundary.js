// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorKey: 0 };
  }

  static getDerivedStateFromError(error) {
    console.warn('🛑 Error capturado por ErrorBoundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado:", error, errorInfo);
  }

  componentDidUpdate(_, prevState) {
    if (this.state.hasError && !prevState.hasError) {
      // Reiniciar automáticamente después de 500ms
      setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          errorKey: prev.errorKey + 1
        }));
      }, 500);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-recovery">
          <p>⚠️ Ocurrió un problema. Intentando recuperar el juego...</p>
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.errorKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export default ErrorBoundary;
