import { Component, type ReactNode } from 'react';
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        <main style={{ padding: '4rem', maxWidth: 640, margin: 'auto' }}>
          <h1>Something went wrong.</h1>
          <p>
            Your saved data is still here. Reload the application to try again.
          </p>
          <button onClick={() => window.location.reload()}>
            Reload application
          </button>
        </main>
      );
    return this.props.children;
  }
}
