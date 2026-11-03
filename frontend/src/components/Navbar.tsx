import React from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle, Clock, RotateCcw, Loader2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  onTriggerScenario: (claimId: string) => void;
  isStreaming: boolean;
  activeClaimId?: string;
  isResetting?: boolean;
  onResetDatabase?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  onTriggerScenario,
  isStreaming,
  activeClaimId,
  isResetting = false,
  onResetDatabase,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Clean Brand / Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer shrink-0" 
            onClick={() => setActiveTab('ledger')}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                GrantPool<span className="text-sky-600">.AI</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>PayPal Sandbox (Live Connected)</span>
              </span>
            </div>
          </div>

          {/* Quick Demo Buttons (Hero Actions) */}
          <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onTriggerScenario('CLM-FLOOD-01')}
              disabled={isStreaming}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 border transition-all shadow-xs active:scale-95 ${
                isStreaming && activeClaimId === 'CLM-FLOOD-01'
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                  : 'bg-white hover:bg-rose-50 text-rose-700 border-slate-200 hover:border-rose-200'
              }`}
              title="Detects 56.3% price markup and halts payout"
            >
              {isStreaming && activeClaimId === 'CLM-FLOOD-01' ? (
                <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{isStreaming && activeClaimId === 'CLM-FLOOD-01' ? 'Auditing...' : '1. Fraud Catch'}</span>
            </button>

            <button
              onClick={() => onTriggerScenario('CLM-WATER-02')}
              disabled={isStreaming}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 border transition-all shadow-xs active:scale-95 ${
                isStreaming && activeClaimId === 'CLM-WATER-02'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                  : 'bg-white hover:bg-emerald-50 text-emerald-700 border-slate-200 hover:border-emerald-200'
              }`}
              title="Verified clean claim triggers PayPal Payout"
            >
              {isStreaming && activeClaimId === 'CLM-WATER-02' ? (
                <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{isStreaming && activeClaimId === 'CLM-WATER-02' ? 'Reconciling...' : '2. Clean Pass'}</span>
            </button>

            <button
              onClick={() => onTriggerScenario('CLM-TECH-03')}
              disabled={isStreaming}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 border transition-all shadow-xs active:scale-95 hidden sm:flex ${
                isStreaming && activeClaimId === 'CLM-TECH-03'
                  ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                  : 'bg-white hover:bg-amber-50 text-amber-700 border-slate-200 hover:border-amber-200'
              }`}
              title="Awaiting beneficiary OTP sign-off"
            >
              {isStreaming && activeClaimId === 'CLM-TECH-03' ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{isStreaming && activeClaimId === 'CLM-TECH-03' ? 'Verifying...' : '3. Pending OTP'}</span>
            </button>
          </div>

          {/* Tabs & Refresh */}
          <div className="flex items-center space-x-2">
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'campaigns'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ledger
              </button>
            </nav>

            {onResetDatabase && (
              <button
                onClick={onResetDatabase}
                disabled={isResetting || isStreaming}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-all border border-slate-200 hover:border-rose-200 shadow-xs text-xs font-bold flex items-center space-x-1.5 active:scale-95 disabled:opacity-60"
                title="Reset database to clean 3 initial hackathon test scenarios"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-rose-600' : 'text-slate-500'}`} />
                <span className="hidden md:inline">{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
              </button>
            )}

            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 shadow-xs"
              title="Refresh ledger data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
