import React from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle, Clock, Sparkles, ExternalLink } from 'lucide-react';

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
    <header className="border-b border-white/5 bg-gray-950/70 backdrop-blur-xl sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('ledger')}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/25 ring-1 ring-white/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-gray-950" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
                  GrantPool<span className="text-sky-400">.AI</span>
                </span>
                
                {/* Status Badges */}
                <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-950/80 text-sky-300 border border-sky-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>PayPal Sandbox</span>
                </span>

                <span
                  title="Dual-mode: Real Gemini 2.0 Flash Vision runs when GEMINI_API_KEY is configured in .env."
                  className="hidden md:inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-purple-950/70 text-purple-300 border-purple-800/80 cursor-help"
                >
                  <Sparkles className="w-2.5 h-2.5 text-purple-300" />
                  <span>{systemStatus?.gemini_mode === 'LIVE' ? 'Gemini 2.0 Live' : 'Gemini 2.0 AI'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Autonomous Escrow • Anti-Diversion Reconciler
              </p>
            </div>
          </div>

          {/* Quick Demo Scenario Triggers (Centerpiece of the Demo!) */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-gray-900/90 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">
              Judge Demos:
            </span>

            <button
              onClick={() => onTriggerScenario('CLM-FLOOD-01')}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/70 transition-all shadow-sm active:scale-95 group"
              title="Hero Scenario: Detects 56.3% price markup on rice + 25 missing blankets, freezes $600"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 group-hover:animate-bounce" />
              <span>1. Fraud Catch (Hero)</span>
            </button>

            <button
              onClick={() => onTriggerScenario('CLM-WATER-02')}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-800/70 transition-all shadow-sm active:scale-95"
              title="Clean Scenario: Reconciled delivery triggers autonomous PayPal Payout"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Clean Pass</span>
            </button>

            <button
              onClick={() => onTriggerScenario('CLM-TECH-03')}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800/70 transition-all shadow-sm active:scale-95"
              title="Pending Scenario: Held in escrow until beneficiary OTP verification"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Pending OTP</span>
            </button>
          </div>

          {/* Navigation Tabs & Actions */}
          <div className="flex items-center space-x-2">
            <nav className="flex space-x-1 bg-gray-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'campaigns'
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Audited Ledger
              </button>
            </nav>

            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-slate-400 hover:text-white transition-all border border-white/10"
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
