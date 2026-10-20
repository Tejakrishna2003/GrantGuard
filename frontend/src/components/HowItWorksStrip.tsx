import React from 'react';
import { Heart, Shield, Cpu, Smartphone, Send, ArrowRight } from 'lucide-react';

interface HowItWorksStripProps {
  activeStep?: number; // 1 to 5, or 0/undefined
}

export const HowItWorksStrip: React.FC<HowItWorksStripProps> = ({ activeStep }) => {
  const steps = [
    {
      id: 1,
      title: 'Donor Escrow Pool',
      subtitle: 'PayPal Smart Buttons',
      desc: 'Capital pooled securely in programmatic escrow',
      icon: Heart,
      color: 'sky',
    },
    {
      id: 2,
      title: 'Vendor Invoicing',
      subtitle: 'Gemini 2.0 Flash Vision',
      desc: 'Multimodal OCR extracts itemized invoice details',
      icon: Cpu,
      color: 'purple',
    },
    {
      id: 3,
      title: 'UN WFP Price Check',
      subtitle: 'HDX Global Benchmarks',
      desc: 'Compares unit rates to detect markups and gouging',
      icon: Shield,
      color: 'indigo',
    },
    {
      id: 4,
      title: 'Beneficiary Sign-Off',
      subtitle: 'Twilio OTP + EXIF Photo',
      desc: 'Recipients confirm ground-truth physical delivery',
      icon: Smartphone,
      color: 'emerald',
    },
    {
      id: 5,
      title: 'Autonomous Payout',
      subtitle: 'PayPal Payouts REST API',
      desc: 'Released only if 100% matched, otherwise frozen',
      icon: Send,
      color: 'emerald',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
            4-Way Reconciliation Architecture
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            How funds move securely from donor to verified vendor
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Zero-Trust Escrow Protocol</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isActive = activeStep === st.id;

          return (
            <div
              key={st.id}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 ${
                isActive
                  ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200 shadow-sm scale-[1.02]'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  STEP 0{st.id}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {st.title}
              </h4>
              <p className="text-xs font-semibold text-sky-700 mt-0.5">
                {st.subtitle}
              </p>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-medium">
                {st.desc}
              </p>

              {idx < steps.length - 1 && (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
