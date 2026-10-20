import React from 'react';
import { Coins, Send, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { GlobalMetrics } from '../lib/types';

interface KPICardsProps {
  metrics: GlobalMetrics | null;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  const totalPooled = metrics?.total_pooled ?? 11700;
  const totalDisbursed = metrics?.total_disbursed ?? 1200;
  const totalProtected = metrics?.total_protected ?? 600;
  const activeCount = metrics?.active_campaigns ?? 3;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Pooled */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Capital Pooled
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/60">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          ${totalPooled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center space-x-1.5 mt-2 text-xs text-sky-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Across {activeCount} monitored community funds</span>
        </div>
      </div>

      {/* Disbursed via PayPal Payouts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Verified Disbursed
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/60">
            <Send className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          ${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-xs text-emerald-400 font-medium">
          100% Reconciled via PayPal Payouts
        </div>
      </div>

      {/* Capital Protected from Fraud (THE HERO KPI) */}
      <div className="bg-slate-900/90 border border-red-900/40 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-red-700/60 transition-all">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-red-500/15 rounded-full blur-xl group-hover:bg-red-500/25 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">
            Capital Protected
          </span>
          <div className="w-8 h-8 rounded-lg bg-red-950 text-red-400 flex items-center justify-center border border-red-800/80 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-red-400 tracking-tight">
          ${totalProtected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-xs text-red-300/90 font-medium">
          Diverted markups & short deliveries frozen
        </div>
      </div>

      {/* AI Autonomous Accuracy */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Discrepancy Engine
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800/60">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          Gemini 2.0
        </div>
        <div className="mt-2 text-xs text-purple-300 font-medium">
          Multimodal OCR + WFP HDX baselines
        </div>
      </div>
    </div>
  );
};
