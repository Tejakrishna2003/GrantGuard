import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Heart } from 'lucide-react';
import { Campaign } from '../lib/types';
import { api } from '../lib/api';

interface PayPalDonationBtnProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
}

export const PayPalDonationBtn: React.FC<PayPalDonationBtnProps> = ({
  campaign,
  onClose,
  onSuccess
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const finalAmount = customAmount ? parseFloat(customAmount) || selectedAmount : selectedAmount;

  const handleSimulatedPayPalDonation = async () => {
    setLoading(true);
    try {
      const res = await api.captureDonation(campaign.id, finalAmount, donorName);
      setSuccessMsg(`PayPal Donation Captured! $${finalAmount.toFixed(2)} added to ${campaign.title}`);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-sky-400 mb-2">
          <Heart className="w-5 h-5 text-red-400" />
          <span className="text-xs font-bold uppercase tracking-wider">PayPal Sandbox Escrow</span>
        </div>

        <h3 className="text-xl font-bold text-white">
          Contribute to {campaign.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Your capital is locked in programmatic escrow. It is only released when delivery proof passes AI audit.
        </p>

        {successMsg ? (
          <div className="my-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">{successMsg}</div>
            <div className="text-xs text-emerald-300">Transaction recorded in live AG Grid ledger.</div>
          </div>
        ) : (
          <div className="space-y-4 my-6">
            {/* Amount Tiers */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Or Enter Custom Donation ($)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Custom USD amount"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Donor Name */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="E.g. Sarah Jenkins (or Anonymous)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* PayPal Smart Button Component */}
            <div className="pt-2">
              <button
                onClick={handleSimulatedPayPalDonation}
                disabled={loading}
                className="w-full py-3 bg-[#0070BA] hover:bg-[#003087] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <span className="italic font-black text-base">PayPal</span>
                <span>• Contribute ${finalAmount.toFixed(2)}</span>
              </button>
              <span className="text-[10px] text-center block text-slate-500 mt-2">
                Simulated Sandbox Checkout • Direct deposit into community escrow
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
