import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Bina Bangsa Portal Uncaught Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4f9f8] flex items-center justify-center p-6 text-[#082142] font-sans">
          <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-[#cbe6e3] shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#082142] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#40535e] mb-6 leading-relaxed">
              The application encountered an unexpected issue. You can safely reload the portal to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-full bg-[#139a91] hover:bg-[#0e8b83] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Portal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


