import React, { useState } from 'react';
import { Heart, ShieldCheck, Users, CheckCircle, ExternalLink, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Campaign } from '../lib/types';
import { PayPalDonationBtn } from './PayPalDonationBtn';

interface CampaignHeroProps {
  campaigns: Campaign[];
  onDonateSuccess: () => void;
  onOpenClaimModal: (campaign: Campaign) => void;
  onOpenVerifyModal: (campaign: Campaign) => void;
}

export const CampaignHero: React.FC<CampaignHeroProps> = ({
  campaigns,
  onDonateSuccess,
  onOpenClaimModal,
  onOpenVerifyModal
}) => {
  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState<Campaign | null>(null);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-slate-900 border border-white/10 p-8 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Autonomous AI Escrow & Anti-Diversion Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            100% Donor Transparency. <br />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Zero Middleman Theft.
            </span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Community relief pools where pooled donor capital is held safely in escrow.
            Capital only disburses via <strong>PayPal Payouts</strong> when <strong>Gemini 2.0 Flash Vision</strong> cross-reconciles vendor invoices with UN WFP fair pricing and beneficiary OTP field delivery proof.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6 text-xs text-slate-300">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>UN WFP Price Protection</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Twilio SMS OTP Field Proof</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>AG Grid Forensic Ledger</span>
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span>Active Community Relief Pools</span>
          </h2>
          <span className="text-xs text-slate-400">
            {campaigns.length} escrow-protected pools active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const fundedPercent = Math.min(100, Math.round((camp.current_pooled / camp.target_amount) * 100));

            return (
              <div
                key={camp.id}
                className="glass-panel rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-sky-500/40 transition-all duration-300 group"
              >
                {camp.image_url && (
                  <div className="h-48 w-full relative overflow-hidden bg-slate-950">
                    <img
                      src={camp.image_url}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                      {camp.category}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-sky-950/80 backdrop-blur-md rounded-full text-[10px] font-mono font-bold text-sky-300 border border-sky-800">
                      {fundedPercent}% FUNDED
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-sky-300 transition-colors">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Pooled Capital</span>
                      <span className="font-mono font-bold text-white">
                        ${camp.current_pooled.toLocaleString()} / ${camp.target_amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        style={{ width: `${fundedPercent}%` }}
                        className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-sky-500/50"
                      />
                    </div>

                    {camp.protected_fraud_amount > 0 ? (
                      <div className="mt-2.5 text-[11px] font-semibold text-red-400 flex items-center space-x-1.5 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800/50">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>${camp.protected_fraud_amount.toLocaleString()} fraud markup blocked by AI</span>
                      </div>
                    ) : (
                      <div className="mt-2.5 text-[11px] font-medium text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>100% Escrow Reconciled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedDonationCampaign(camp)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 via-sky-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                  >
                    <span>Contribute</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenClaimModal(camp)}
                    className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-all active:scale-95"
                    title="Vendor: Submit invoice claim for AI audit"
                  >
                    Claim
                  </button>

                  <button
                    onClick={() => onOpenVerifyModal(camp)}
                    className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold border border-emerald-800/80 transition-all active:scale-95"
                    title="Beneficiary: Verify receipt with OTP & photo"
                  >
                    Verify
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Donation Modal with PayPal Smart Button */}
      {selectedDonationCampaign && (
        <PayPalDonationBtn
          campaign={selectedDonationCampaign}
          onClose={() => setSelectedDonationCampaign(null)}
          onSuccess={() => {
            setSelectedDonationCampaign(null);
            onDonateSuccess();
          }}
        />
      )}
    </div>
  );
};
