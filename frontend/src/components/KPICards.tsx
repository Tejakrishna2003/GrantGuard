import React from 'react';
import { Coins, Send, ShieldAlert, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
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
      {/* 1. Total Capital Pooled */}
      <div className="glass-panel rounded-2xl p-4.5 relative overflow-hidden group hover:border-sky-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Capital Pooled
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl font-black text-white font-mono tracking-tight">
          ${totalPooled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div className="flex items-center space-x-1.5 mt-2.5 text-[11px] text-sky-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span>Across {activeCount} community relief pools</span>
        </div>
      </div>

      {/* 2. Disbursed via PayPal Payouts */}
      <div className="glass-panel rounded-2xl p-4.5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Verified Disbursed
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Send className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl font-black text-white font-mono tracking-tight">
          ${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div className="flex items-center space-x-1.5 mt-2.5 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>100% Reconciled via PayPal Payouts</span>
        </div>
      </div>

      {/* 3. Fraud Capital Protected (HERO KPI) */}
      <div className="glass-panel rounded-2xl p-4.5 relative overflow-hidden border-red-500/30 shadow-lg shadow-red-500/5 group hover:border-red-500/50 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/15 rounded-full blur-2xl group-hover:bg-red-500/25 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">
            Capital Protected
          </span>
          <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/30 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl font-black text-red-400 font-mono tracking-tight">
          ${totalProtected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div className="mt-2.5 text-[11px] text-red-300/90 font-medium">
          Diverted markups & short deliveries frozen
        </div>
      </div>

      {/* 4. Autonomous Agent Engine */}
      <div className="glass-panel rounded-2xl p-4.5 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Discrepancy Engine
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl font-black text-white tracking-tight">
          Gemini 2.0
        </div>

        <div className="mt-2.5 text-[11px] text-purple-300/90 font-medium">
          Multimodal OCR • WFP HDX baselines
        </div>
      </div>
    </div>
  );
};
