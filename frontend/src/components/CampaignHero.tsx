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
      {/* Hero Banner with Larger, Highly Readable Typography */}
      <div className="relative rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-sm overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-sm font-bold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Autonomous AI Escrow & Anti-Diversion Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            100% Donor Transparency. <br />
            <span className="text-sky-600">
              Zero Middleman Theft.
            </span>
          </h1>

          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            Community relief pools where pooled donor capital is held safely in escrow.
            Capital only disburses via <strong className="text-slate-900">PayPal Payouts</strong> when <strong className="text-slate-900">Gemini 2.0 Flash Vision</strong> cross-reconciles vendor invoices with UN WFP fair pricing and beneficiary OTP field delivery proof.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6 text-sm text-slate-700">
            <span className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>UN WFP Price Protection</span>
            </span>
            <span className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Twilio SMS OTP Field Proof</span>
            </span>
            <span className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>AG Grid Forensic Ledger</span>
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Heart className="w-6 h-6 text-rose-600" />
            <span>Active Community Relief Pools</span>
          </h2>
          <span className="text-sm text-slate-500 font-semibold">
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
                  <div className="h-52 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={camp.image_url}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 uppercase tracking-wider border border-slate-200 shadow-sm">
                      {camp.category}
                    </div>
                    <div className="absolute top-3.5 right-3.5 px-3 py-1 bg-sky-50 backdrop-blur-md rounded-full text-xs font-mono font-bold text-sky-800 border border-sky-200 shadow-sm">
                      {fundedPercent}% FUNDED
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-sky-600 transition-colors">
                      {camp.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 font-semibold">Pooled Capital</span>
                      <span className="font-mono font-black text-slate-900">
                        ${camp.current_pooled.toLocaleString()} / ${camp.target_amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        style={{ width: `${fundedPercent}%` }}
                        className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>

                    {camp.protected_fraud_amount > 0 ? (
                      <div className="mt-3 text-xs font-bold text-rose-700 flex items-center space-x-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                        <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>${camp.protected_fraud_amount.toLocaleString()} fraud markup blocked by AI</span>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>100% Escrow Reconciled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5">
                  <button
                    onClick={() => setSelectedDonationCampaign(camp)}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                  >
                    <span>Contribute</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenClaimModal(camp)}
                    className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-sm font-bold border border-slate-300 transition-all shadow-sm active:scale-95"
                    title="Vendor: Submit invoice claim for AI audit"
                  >
                    Claim
                  </button>

                  <button
                    onClick={() => onOpenVerifyModal(camp)}
                    className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-sm font-bold border border-emerald-200 transition-all shadow-sm active:scale-95"
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
