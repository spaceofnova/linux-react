import { Component, ErrorInfo } from "react";

const DEFAULT_ERROR_MESSAGE = "Something went wrong.";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  errorMessage?: string;
};

type State = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1 className="error">
          {this.props.errorMessage || DEFAULT_ERROR_MESSAGE}
        </h1>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
