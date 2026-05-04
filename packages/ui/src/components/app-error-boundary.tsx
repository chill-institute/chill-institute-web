import { Component, type ErrorInfo, type ReactNode } from "react";

import { AppErrorFallback } from "./app-error-fallback";

type AppErrorBoundaryProps = {
  /** App identifier baked into the crash report — e.g. "binge.institute/web". */
  app: string;
  /** Build release identifier (defaults to "dev" inside the fallback). */
  release?: string;
  children: ReactNode;
};

type AppErrorBoundaryState = {
  componentStack?: string;
  error: unknown;
};

/*
 * Top-level crash boundary. Mounts <AppErrorFallback> with the app
 * identifier and (optional) release tag once a render throws. Each
 * app passes its own `app` so the JSON report tags itself correctly.
 */
class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    componentStack: undefined,
    error: null,
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      componentStack: undefined,
      error,
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.setState({
      componentStack: info.componentStack || undefined,
      error,
    });
  }

  reset = () => {
    this.setState({
      componentStack: undefined,
      error: null,
    });
  };

  render() {
    if (this.state.error) {
      return (
        <AppErrorFallback
          app={this.props.app}
          release={this.props.release}
          error={this.state.error}
          componentStack={this.state.componentStack}
        />
      );
    }

    return this.props.children;
  }
}

export { AppErrorBoundary };
