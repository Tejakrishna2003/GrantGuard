import React from 'react';
import { PieChart, TrendingUp, ShieldCheck, DollarSign, Lock, CheckCircle2 } from 'lucide-react';
import { Campaign } from '../lib/types';

interface FundingProgressChartProps {
  campaigns: Campaign[];
}

export const FundingProgressChart: React.FC<FundingProgressChartProps> = ({ campaigns }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-xl mb-6 border border-white/10">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <PieChart className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white tracking-tight uppercase">
            Escrow Pool Allocation & Fraud Shields
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Multi-Milestone Capital Health
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaigns.map((camp) => {
          const percentFunded = Math.min(100, Math.round((camp.current_pooled / camp.target_amount) * 100));
          const percentDisbursed = Math.min(100, Math.round((camp.disbursed_amount / camp.target_amount) * 100));
          const escrowRemaining = camp.current_pooled - camp.disbursed_amount;
          const hasProtection = camp.protected_fraud_amount > 0;

          return (
            <div key={camp.id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between text-xs mb-2">
                  <span className="font-bold text-slate-100 truncate pr-2">{camp.title}</span>
                  <span className="font-mono text-sky-400 font-bold shrink-0">{percentFunded}%</span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono mb-2">
                  ${camp.current_pooled.toLocaleString()} of ${camp.target_amount.toLocaleString()} target
                </div>

                {/* Multi-segment Progress Bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex border border-white/5">
                  <div
                    style={{ width: `${percentDisbursed}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Disbursed: $${camp.disbursed_amount}`}
                  />
                  <div
                    style={{ width: `${Math.max(0, percentFunded - percentDisbursed)}%` }}
                    className="bg-sky-500 h-full transition-all duration-500"
                    title={`In Escrow: $${escrowRemaining}`}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Disbursed via Payouts:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">${camp.disbursed_amount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>Locked in Escrow:</span>
                  </span>
                  <span className="font-mono font-bold text-sky-400">${escrowRemaining.toLocaleString()}</span>
                </div>

                {hasProtection && (
                  <div className="flex items-center justify-between text-red-300 font-semibold pt-1 border-t border-red-900/30">
                    <span className="flex items-center space-x-1 text-red-400">
                      <ShieldCheck className="w-3 h-3 text-red-400" />
                      <span>Fraud Freeze:</span>
                    </span>
                    <span className="font-mono text-red-400 font-bold">${camp.protected_fraud_amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
