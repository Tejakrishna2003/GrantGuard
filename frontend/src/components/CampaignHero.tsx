import React, { useState } from 'react';
import { Heart, ShieldCheck, Users, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
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
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-slate-800 p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-sky-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous AI Escrow & Anti-Diversion Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            100% Donor Transparency. <br />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Zero Middleman Theft.
            </span>
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Community grant pools where capital only moves when delivery is cryptographically verified by beneficiaries.
            Powered by <strong>PayPal Donations</strong>, <strong>PayPal Payouts</strong>, and <strong>Gemini 2.0 Flash Vision</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>UN WFP Price Benchmark Protection</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Twilio OTP Beneficiary Verification</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Real-Time AG Grid Audited Ledger</span>
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 tracking-tight flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-400" />
          <span>Active Community Relief Pools</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const fundedPercent = Math.min(100, Math.round((camp.current_pooled / camp.target_amount) * 100));

            return (
              <div
                key={camp.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                {camp.image_url && (
                  <div className="h-44 w-full relative overflow-hidden">
                    <img
                      src={camp.image_url}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                      {camp.category}
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-sky-400 transition-colors">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Pooled Capital</span>
                      <span className="font-mono font-bold text-white">
                        ${camp.current_pooled.toLocaleString()} / ${camp.target_amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${fundedPercent}%` }}
                        className="bg-gradient-to-r from-sky-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      />
                    </div>

                    {camp.protected_fraud_amount > 0 && (
                      <div className="mt-2 text-[11px] font-semibold text-red-400 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>${camp.protected_fraud_amount} fraud capital blocked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedDonationCampaign(camp)}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Contribute</span>
                  </button>

                  <button
                    onClick={() => onOpenClaimModal(camp)}
                    className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-all"
                    title="Vendor: Submit invoice claim"
                  >
                    Claim
                  </button>

                  <button
                    onClick={() => onOpenVerifyModal(camp)}
                    className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-all"
                    title="Beneficiary: Field OTP Verification"
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
