import React, { useState } from 'react';
import { Heart, ShieldCheck, Users, CheckCircle, ExternalLink, Sparkles, ArrowUpRight } from 'lucide-react';
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
      <div className="relative rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-sm overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Autonomous AI Escrow & Anti-Diversion Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            100% Donor Transparency. <br />
            <span className="text-sky-600">
              Zero Middleman Theft.
            </span>
          </h1>

          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            Community relief pools where pooled donor capital is held safely in escrow.
            Capital only disburses via <strong className="text-slate-900">PayPal Payouts</strong> when <strong className="text-slate-900">Gemini 2.0 Flash Vision</strong> cross-reconciles vendor invoices with UN WFP fair pricing and beneficiary OTP field delivery proof.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6 text-xs text-slate-700">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">UN WFP Price Protection</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">Twilio SMS OTP Field Proof</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">AG Grid Forensic Ledger</span>
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <span>Active Community Relief Pools</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {campaigns.length} escrow-protected pools active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const fundedPercent = Math.min(100, Math.round((camp.current_pooled / camp.target_amount) * 100));

            return (
              <div
                key={camp.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group"
              >
                {camp.image_url && (
                  <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={camp.image_url}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-wider border border-slate-200 shadow-sm">
                      {camp.category}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-sky-50 backdrop-blur-md rounded-full text-[10px] font-mono font-bold text-sky-800 border border-sky-200 shadow-sm">
                      {fundedPercent}% FUNDED
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-sky-600 transition-colors">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Pooled Capital</span>
                      <span className="font-mono font-bold text-slate-900">
                        ${camp.current_pooled.toLocaleString()} / ${camp.target_amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        style={{ width: `${fundedPercent}%` }}
                        className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>

                    {camp.protected_fraud_amount > 0 ? (
                      <div className="mt-2.5 text-xs font-semibold text-rose-700 flex items-center space-x-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>${camp.protected_fraud_amount.toLocaleString()} fraud markup blocked by AI</span>
                      </div>
                    ) : (
                      <div className="mt-2.5 text-xs font-medium text-emerald-700 flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>100% Escrow Reconciled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedDonationCampaign(camp)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                  >
                    <span>Contribute</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenClaimModal(camp)}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition-all shadow-sm active:scale-95"
                    title="Vendor: Submit invoice claim for AI audit"
                  >
                    Claim
                  </button>

                  <button
                    onClick={() => onOpenVerifyModal(camp)}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 transition-all shadow-sm active:scale-95"
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
