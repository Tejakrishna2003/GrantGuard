import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught unhandled UI exception:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <AlertOctagon className="w-8 h-8 text-rose-600" />
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 mb-3">
              UI Application Fault Isolated
            </span>

            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
              An unexpected render error occurred
            </h2>

            <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
              GrantPool AI has safely caught this UI exception to prevent data loss. You can reload the application or reset the component view.
            </p>

            {this.state.error && (
              <div className="mb-6 text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-rose-700 overflow-x-auto max-h-32">
                <span className="font-bold">Error:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recover State</span>
              </button>

              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
