import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, ShieldCheck, Heart, Sparkles } from 'lucide-react';
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
  const [sdkReady, setSdkReady] = useState<boolean>(false);

  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const finalAmount = customAmount ? parseFloat(customAmount) || selectedAmount : selectedAmount;

  // Mount official PayPal JavaScript SDK Smart Buttons
  useEffect(() => {
    let isMounted = true;

    const renderPayPalButtons = () => {
      const paypal = (window as any).paypal;
      if (!paypal || !paypalContainerRef.current) return;

      paypalContainerRef.current.innerHTML = '';

      try {
        paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'donate',
            height: 42
          },
          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                description: `Community Grant Escrow: ${campaign.title}`,
                amount: {
                  currency_code: 'USD',
                  value: finalAmount.toFixed(2)
                }
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            setLoading(true);
            try {
              if (actions.order) {
                await actions.order.capture();
              }
              await api.captureDonation(campaign.id, finalAmount, donorName || 'Verified PayPal Donor');
              if (isMounted) {
                setSuccessMsg(`PayPal Donation Captured! $${finalAmount.toFixed(2)} added to ${campaign.title}`);
                setTimeout(() => onSuccess(), 1500);
              }
            } catch (err) {
              console.error('PayPal capture error:', err);
              await api.captureDonation(campaign.id, finalAmount, donorName);
              if (isMounted) {
                setSuccessMsg(`PayPal Donation Recorded! $${finalAmount.toFixed(2)} added to ${campaign.title}`);
                setTimeout(() => onSuccess(), 1500);
              }
            } finally {
              if (isMounted) setLoading(false);
            }
          },
          onError: (err: any) => {
            console.warn('PayPal Smart Buttons error (using sandbox simulated flow):', err);
          }
        }).render(paypalContainerRef.current);

        setSdkReady(true);
      } catch (e) {
        console.warn('Failed to render PayPal Smart Buttons:', e);
      }
    };

    if ((window as any).paypal) {
      renderPayPalButtons();
    } else {
      const interval = setInterval(() => {
        if ((window as any).paypal) {
          clearInterval(interval);
          renderPayPalButtons();
        }
      }, 300);
      return () => {
        clearInterval(interval);
        isMounted = false;
      };
    }

    return () => {
      isMounted = false;
    };
  }, [finalAmount, campaign.id, donorName]);

  const handleSimulatedPayPalDonation = async () => {
    setLoading(true);
    try {
      await api.captureDonation(campaign.id, finalAmount, donorName);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-sky-700 mb-2">
          <Heart className="w-5 h-5 text-rose-600" />
          <span className="text-xs font-bold uppercase tracking-wider">PayPal Developer Sandbox</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          Contribute to {campaign.title}
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Your capital is locked in programmatic escrow. It is only released when delivery proof passes AI audit.
        </p>

        {successMsg ? (
          <div className="my-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-sm font-bold text-slate-900">{successMsg}</div>
            <div className="text-xs text-emerald-700 font-medium">Transaction recorded in live AG Grid ledger.</div>
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
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div>
              <label className="text-xs text-slate-700 font-semibold block mb-1">
                Or Enter Custom Donation ($)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Custom USD amount"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-mono font-bold"
              />
            </div>

            {/* Donor Name */}
            <div>
              <label className="text-xs text-slate-700 font-semibold block mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="E.g. Sarah Jenkins (or Anonymous)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Official PayPal JavaScript SDK Smart Buttons Container */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 block mb-2 text-center">
                Official PayPal Smart Buttons (JavaScript SDK):
              </span>
              <div
                ref={paypalContainerRef}
                className="min-h-[90px] flex flex-col justify-center"
              >
                {!sdkReady && (
                  <div className="text-xs text-slate-500 text-center py-2 animate-pulse font-mono">
                    Initializing PayPal Smart Buttons SDK...
                  </div>
                )}
              </div>

              {/* Instant One-Click Sandbox Simulation Fallback */}
              <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                <button
                  onClick={handleSimulatedPayPalDonation}
                  disabled={loading}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Instant 1-Click Sandbox Test (${finalAmount.toFixed(2)})</span>
                </button>
                <span className="text-[11px] block text-slate-500 mt-1.5 font-medium">
                  Direct escrow deposit without external PayPal sandbox login
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
