import { Component, ErrorInfo } from "react";

const DEFAULT_ERROR_MESSAGE = "Something went wrong.";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  errorComponent?: (error: Error, componentStack: string) => React.ReactNode;
  errorMessage?: string;
};

type State = {
  hasError: boolean;
  error?: Error;
  componentStack?: string;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
    this.setState({ 
      hasError: true, 
      error: error,
      componentStack: errorInfo.componentStack || "" 
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const error = this.state.error || new Error(this.props.errorMessage || DEFAULT_ERROR_MESSAGE);
      
      if (this.props.errorComponent) {
        return this.props.errorComponent(error, this.state.componentStack || "");
      }

      return (
        <div className="error-boundary">
          <h1 className="error">
            {this.props.errorMessage || DEFAULT_ERROR_MESSAGE}
          </h1>
          <pre className="error-details">
            {error.toString()}
            {this.state.componentStack && (
              <>
                <br />
                <br />
                Component Stack:
                <br />
                {this.state.componentStack}
              </>
            )}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
