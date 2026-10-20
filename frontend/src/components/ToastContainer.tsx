import React from 'react';
import { CheckCircle, AlertTriangle, X, Send } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'PAYPAL_PAYOUT' | 'FRAUD_HALT' | 'INFO';
  title: string;
  message: string;
  batchId?: string;
  amount?: number;
}

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isPayout = toast.type === 'PAYPAL_PAYOUT';
        const isHalt = toast.type === 'FRAUD_HALT';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl transition-all duration-300 animate-fadeIn ${
              isPayout
                ? 'bg-emerald-900 text-white border-emerald-700'
                : isHalt
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isPayout ? 'bg-emerald-800 text-emerald-200' : isHalt ? 'bg-rose-800 text-rose-200' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {isPayout ? <Send className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>

                <div>
                  <h5 className="text-sm font-bold leading-snug">
                    {toast.title}
                  </h5>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {toast.message}
                  </p>

                  {toast.batchId && (
                    <div className="mt-2 text-[11px] font-mono bg-black/30 px-2 py-0.5 rounded border border-white/10 inline-block text-emerald-300">
                      PayPal Batch: {toast.batchId}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
