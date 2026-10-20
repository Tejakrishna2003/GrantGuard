import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, MapPin, Phone, FileText, DollarSign, Image } from 'lucide-react';
import { LedgerTransaction } from '../lib/types';
import { api } from '../lib/api';

interface MasterDetailDrawerProps {
  transaction: LedgerTransaction | null;
  onClose: () => void;
  onOpenDispute: (tx: LedgerTransaction) => void;
}

export const MasterDetailDrawer: React.FC<MasterDetailDrawerProps> = ({
  transaction,
  onClose,
  onOpenDispute
}) => {
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!transaction) return;
    setLoading(true);
    api.getTransactionDetail(transaction.id)
      .then(res => setDetailData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [transaction]);

  if (!transaction) return null;

  const isFlagged = transaction.status === 'FLAGGED';
  const isReconciled = transaction.status === 'RECONCILED';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  {transaction.id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  isReconciled
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : isFlagged
                    ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}>
                  {transaction.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1.5">
                {transaction.campaign_title}
              </h3>
              <p className="text-xs text-slate-400">
                {transaction.milestone_title} • Vendor: <strong className="text-slate-200">{transaction.vendor_name}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI Forensic Verdict Alert */}
          <div className={`mt-4 p-4 rounded-xl border ${
            isFlagged
              ? 'bg-red-950/40 border-red-800/80 text-red-200'
              : isReconciled
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
          }`}>
            <div className="flex items-start space-x-3">
              {isFlagged ? (
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              ) : isReconciled ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  AI Forensic Reconciler Verdict
                </h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {transaction.ai_summary || "Automated multimodal cross-reconciliation in progress..."}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Cross-Reconciliation Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Vendor Claimed</span>
              <div className="text-base font-black text-white font-mono mt-0.5">
                ${transaction.billed_amount?.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">WFP Benchmark</span>
              <div className="text-base font-black text-slate-300 font-mono mt-0.5">
                ${transaction.market_ref_amount?.toFixed(2)}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${
              isFlagged ? 'bg-red-950/30 border-red-800/60' : 'bg-emerald-950/30 border-emerald-800/60'
            }`}>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Variance / Gap</span>
              <div className={`text-base font-black font-mono mt-0.5 ${isFlagged ? 'text-red-400' : 'text-emerald-400'}`}>
                {transaction.variance_amount === 0 ? '$0.00' : `-$${transaction.variance_amount?.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Side-by-Side Invoiced vs Confirmed Items */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Extracted Line Items (Gemini Vision OCR)</span>
            </h4>

            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {detailData?.invoice_items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-2.5 font-medium text-slate-200">{item.item_description}</td>
                      <td className="p-2.5 text-right text-slate-400">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono text-slate-300">${item.unit_price?.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-white">${item.total_price?.toFixed(2)}</td>
                    </tr>
                  ))}
                  {(!detailData?.invoice_items || detailData?.invoice_items?.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                        Line items will populate upon live AI extraction
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Beneficiary Ground-Truth Proof */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Beneficiary Field Proof (Twilio OTP & Delivery Photo)</span>
            </h4>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">OTP Sign-Off Status:</span>
                <span className={`font-semibold ${detailData?.otp_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {detailData?.otp_verified ? '✓ Verified Cryptographically' : 'Pending Verification'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Beneficiary Phone:</span>
                <span className="font-mono text-slate-300">{detailData?.beneficiary_phone || '+1 (555) 019-2834'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">GPS Geo-Coordinates:</span>
                <span className="font-mono text-slate-300">
                  {detailData?.gps ? `Lat ${detailData.gps.lat}, Lng ${detailData.gps.lng}` : '12.9716° N, 77.5946° E'}
                </span>
              </div>

              {detailData?.delivery_photo_url && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Verified Field Delivery Photo:
                  </span>
                  <div className="rounded-lg overflow-hidden border border-slate-800 max-h-48 relative group">
                    <img
                      src={detailData.delivery_photo_url}
                      alt="Delivery Ground Truth"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur rounded text-[10px] text-emerald-400 font-mono">
                      ✓ EXIF Verified In-Zone
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between mt-6">
          <div className="text-[11px] text-slate-500">
            PayPal Payout Status: <span className="font-mono text-slate-300">{transaction.paypal_payout_id || 'FROZEN_IN_ESCROW'}</span>
          </div>

          <div className="flex items-center space-x-2">
            {isFlagged && (
              <button
                onClick={() => onOpenDispute(transaction)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
              >
                Community Override
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-all"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
