import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("App shell crashed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070A12] p-8 text-white">
          <div className="mx-auto max-w-2xl rounded-3xl border border-rose-400/30 bg-rose-500/10 p-8">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-rose-100">The app recovered safely. Refresh to continue scanning.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
