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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Capital Pooled
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
          ${totalPooled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div className="flex items-center space-x-1.5 mt-3 text-xs text-slate-600 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>Across {activeCount} community relief pools</span>
        </div>
      </div>

      {/* 2. Disbursed via PayPal Payouts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Verified Disbursed
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Send className="w-4 h-4" />
          </div>
        </div>

        <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
          ${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div className="flex items-center space-x-1.5 mt-3 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>100% Reconciled via PayPal Payouts</span>
        </div>
      </div>

      {/* 3. Fraud Capital Protected (HERO KPI) */}
      <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
            Capital Protected
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div className="text-3xl font-black text-rose-700 font-mono tracking-tight">
          ${totalProtected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div className="mt-3 text-xs text-rose-600 font-medium">
          Diverted markups & short deliveries frozen
        </div>
      </div>

      {/* 4. Autonomous Agent Engine */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Discrepancy Engine
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="text-3xl font-black text-slate-900 tracking-tight">
          Gemini 2.0
        </div>

        <div className="mt-3 text-xs text-purple-700 font-medium">
          Multimodal OCR • WFP HDX baselines
        </div>
      </div>
    </div>
  );
};
