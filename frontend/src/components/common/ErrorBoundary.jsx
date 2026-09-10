import React from 'react';
import { AlertTriangle, RefreshCw, Terminal, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL UI EXCEPTION CAUGHT BY ERROR BOUNDARY:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col items-center justify-center p-6 font-mono select-none">
          <div className="w-full max-w-xl bg-[#0B101D] border border-red-500/40 rounded-2xl p-6 shadow-2xl shadow-red-950/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Tactical Interface Self-Healing Intercept
                  </h2>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/50">
                    PROTECTION ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  An unexpected render exception was caught and neutralized to protect command operations.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-3 rounded-lg bg-[#070A12] border border-white/10 text-xs text-red-300 font-mono overflow-x-auto max-h-32">
              <span className="font-bold text-slate-400">Exception: </span>
              {this.state.error?.message || 'Unknown render exception'}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Recover Interface State</span>
              </button>

              <button
                onClick={this.handleReload}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Command Center</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
