import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/Button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled runtime exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark flex flex-col justify-center items-center p-6 text-left">
          <div className="max-w-md w-full bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400">
                  System Exception Alert
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  Unexpected Error Occurred
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              The application encountered an unhandled runtime error. Our automated telemetry logs have recorded this event for system maintenance.
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex space-x-3">
              <Button
                variant="secondary"
                className="flex-1 justify-center text-xs font-bold"
                onClick={this.handleReset}
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Return to Homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
