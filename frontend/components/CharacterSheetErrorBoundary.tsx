"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class CharacterSheetErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Character sheet error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <div className="p-4 border border-red-300 rounded-md bg-red-50">
      <h3 className="text-lg font-medium text-red-800">
        Error loading character
      </h3>
      <p className="mt-2 text-sm text-red-600">
        There was an error loading the character data. Please try again.
      </p>
      {process.env.NODE_ENV === "development" && error && (
        <details className="mt-2">
          <summary className="text-sm text-red-600 cursor-pointer">
            Error details
          </summary>
          <pre className="mt-1 text-xs text-red-500 overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      <button
        onClick={resetError}
        className="mt-3 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
}
