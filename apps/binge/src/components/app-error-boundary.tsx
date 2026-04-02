import { Component, type ErrorInfo, type ReactNode } from "react";

import { AppErrorFallback } from "@/components/app-error-fallback";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  componentStack?: string;
  error: unknown;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
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
        <AppErrorFallback error={this.state.error} componentStack={this.state.componentStack} />
      );
    }

    return this.props.children;
  }
}
