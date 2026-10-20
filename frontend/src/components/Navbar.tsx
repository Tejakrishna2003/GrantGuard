import React from 'react';
import { ShieldCheck, Activity, Award, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  onTriggerScenario: (claimId: string) => void;
  isStreaming: boolean;
  systemStatus?: {
    demo_mode: boolean;
    gemini_mode: string;
    paypal_mode: string;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  onTriggerScenario,
  isStreaming,
  systemStatus
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('ledger')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
                  GrantPool<span className="text-teal-400">.AI</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-950 text-sky-400 border border-sky-800">
                  PayPal Sandbox
                </span>
                <span
                  title="Dual-mode: Real Gemini 2.0 Flash Vision runs when GEMINI_API_KEY is in .env; currently using deterministic demo mode for zero judge friction."
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center space-x-1 cursor-help ${
                    systemStatus?.gemini_mode === 'LIVE'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-purple-950 text-purple-300 border-purple-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${systemStatus?.gemini_mode === 'LIVE' ? 'bg-emerald-400 animate-ping' : 'bg-purple-400'}`} />
                  <span>Gemini: {systemStatus?.gemini_mode === 'LIVE' ? 'Live' : 'Demo Mode'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous Anti-Diversion Escrow & Audited Ledger
              </p>
            </div>
          </div>

          {/* Quick Demo Scenario Triggers */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">
              Live Demo:
            </span>
            <button
              onClick={() => onTriggerScenario('CLM-FLOOD-01')}
              disabled={isStreaming}
              className="text-xs px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1.5 bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-800/80 transition-all shadow-sm"
              title="Run Hero Demo: AI detects 56% price markup + missing blankets and halts payout"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>1. Fraud Catch (Hero)</span>
            </button>
            <button
              onClick={() => onTriggerScenario('CLM-WATER-02')}
              disabled={isStreaming}
              className="text-xs px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1.5 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 transition-all shadow-sm"
              title="Run Clean Demo: AI confirms 100% reconciliation and triggers PayPal Payout"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Clean Pass</span>
            </button>
            <button
              onClick={() => onTriggerScenario('CLM-TECH-03')}
              disabled={isStreaming}
              className="text-xs px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1.5 bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 transition-all shadow-sm"
              title="Run Pending Demo: Awaiting field volunteer delivery sign-off"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Pending OTP</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2">
            <nav className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'campaigns'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                AG Grid Ledger
              </button>
            </nav>

            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
              title="Refresh ledger data"
            >
              <RefreshCw className={`w-4 h-4 ${isStreaming ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
