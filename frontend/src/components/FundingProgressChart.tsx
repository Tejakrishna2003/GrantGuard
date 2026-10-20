import React from 'react';
import { PieChart, TrendingUp, ShieldCheck, DollarSign, Lock, CheckCircle2 } from 'lucide-react';
import { Campaign } from '../lib/types';

interface FundingProgressChartProps {
  campaigns: Campaign[];
}

export const FundingProgressChart: React.FC<FundingProgressChartProps> = ({ campaigns }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <PieChart className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
            Escrow Pool Allocation & Fraud Shields
          </h3>
        </div>
        <span className="text-sm text-slate-500 font-semibold">
          Multi-Milestone Capital Health
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {campaigns.map((camp) => {
          const percentFunded = Math.min(100, Math.round((camp.current_pooled / camp.target_amount) * 100));
          const percentDisbursed = Math.min(100, Math.round((camp.disbursed_amount / camp.target_amount) * 100));
          const escrowRemaining = camp.current_pooled - camp.disbursed_amount;
          const hasProtection = camp.protected_fraud_amount > 0;

          return (
            <div key={camp.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between text-sm mb-2.5">
                  <span className="font-bold text-slate-900 truncate pr-2">{camp.title}</span>
                  <span className="font-mono text-slate-900 font-black shrink-0">{percentFunded}%</span>
                </div>

                <div className="text-xs text-slate-500 font-mono mb-3">
                  ${camp.current_pooled.toLocaleString()} of ${camp.target_amount.toLocaleString()} target
                </div>

                {/* Multi-segment Progress Bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
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

              <div className="mt-5 pt-4 border-t border-slate-200 space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-medium">Disbursed via Payouts:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">${camp.disbursed_amount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="font-medium">Locked in Escrow:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">${escrowRemaining.toLocaleString()}</span>
                </div>

                {hasProtection && (
                  <div className="flex items-center justify-between text-rose-700 font-bold pt-2 border-t border-rose-200">
                    <span className="flex items-center space-x-1.5 text-rose-700">
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <span>Fraud Freeze:</span>
                    </span>
                    <span className="font-mono text-rose-700 font-black">${camp.protected_fraud_amount.toLocaleString()}</span>
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
