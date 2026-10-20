import React from 'react';
import { PieChart, TrendingUp, ShieldCheck, DollarSign } from 'lucide-react';
import { Campaign } from '../lib/types';

interface FundingProgressChartProps {
  campaigns: Campaign[];
}

export const FundingProgressChart: React.FC<FundingProgressChartProps> = ({ campaigns }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <PieChart className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white tracking-tight uppercase">
            Escrow Pool Allocation & Fraud Shields
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Live Community Capital Stream
        </span>
      </div>

      <div className="space-y-4">
        {campaigns.map((camp) => {
          const percentFunded = Math.min(100, Math.round((camp.current_pooled / camp.target_amount) * 100));
          const percentDisbursed = Math.min(100, Math.round((camp.disbursed_amount / camp.target_amount) * 100));
          const hasProtection = camp.protected_fraud_amount > 0;

          return (
            <div key={camp.id} className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200">{camp.title}</span>
                <span className="font-mono text-sky-400 font-bold">
                  ${camp.current_pooled.toLocaleString()} / ${camp.target_amount.toLocaleString()} ({percentFunded}%)
                </span>
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${percentDisbursed}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Disbursed: $${camp.disbursed_amount}`}
                />
                <div
                  style={{ width: `${Math.max(0, percentFunded - percentDisbursed)}%` }}
                  className="bg-sky-500 h-full transition-all duration-500"
                  title={`Locked in Escrow: $${camp.current_pooled - camp.disbursed_amount}`}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Disbursed: ${camp.disbursed_amount.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>In Escrow: ${(camp.current_pooled - camp.disbursed_amount).toLocaleString()}</span>
                  </span>
                </div>

                {hasProtection && (
                  <span className="text-red-400 font-semibold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-red-400" />
                    <span>Protected: ${camp.protected_fraud_amount.toLocaleString()}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
