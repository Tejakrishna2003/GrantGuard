import React from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle, Clock, Sparkles } from 'lucide-react';

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
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('ledger')}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md ring-1 ring-slate-800">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  GrantPool<span className="text-sky-600">.AI</span>
                </span>
                
                {/* Status Badges */}
                <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <span>PayPal Sandbox</span>
                </span>

                <span
                  title="Dual-mode: Real Gemini 2.0 Flash Vision runs when GEMINI_API_KEY is configured in .env."
                  className="hidden md:inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-purple-50 text-purple-700 border-purple-200 cursor-help"
                >
                  <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                  <span>{systemStatus?.gemini_mode === 'LIVE' ? 'Gemini 2.0 Live' : 'Gemini 2.0 AI'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block tracking-wide font-medium">
                Autonomous Escrow • Anti-Diversion Reconciler
              </p>
            </div>
          </div>

          {/* Quick Demo Scenario Triggers (Centerpiece of the Demo!) */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-inner">
            <span className="text-[10px] font-bold text-slate-500 px-2 uppercase tracking-wider">
              Judge Demos:
            </span>

            <button
              onClick={() => onTriggerScenario('CLM-FLOOD-01')}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all shadow-sm active:scale-95 group"
              title="Hero Scenario: Detects 56.3% price markup on rice + 25 missing blankets, freezes $600"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
              <span>1. Fraud Catch (Hero)</span>
            </button>

            <button
              onClick={() => onTriggerScenario('CLM-WATER-02')}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all shadow-sm active:scale-95"
              title="Clean Scenario: Reconciled delivery triggers autonomous PayPal Payout"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Clean Pass</span>
            </button>

            <button
              onClick={() => onTriggerScenario('CLM-TECH-03')}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all shadow-sm active:scale-95"
              title="Pending Scenario: Held in escrow until beneficiary OTP verification"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>3. Pending OTP</span>
            </button>
          </div>

          {/* Navigation Tabs & Actions */}
          <div className="flex items-center space-x-2">
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'campaigns'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Audited Ledger
              </button>
            </nav>

            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 shadow-sm"
              title="Refresh ledger data"
            >
              <RefreshCw className={`w-4 h-4 ${isStreaming ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
