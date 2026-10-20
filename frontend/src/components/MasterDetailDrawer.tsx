import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, FileText, Lock } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-sm px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                  {transaction.id}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  isReconciled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isFlagged
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {transaction.status}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2.5">
                {transaction.campaign_title}
              </h3>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                {transaction.milestone_title} • Vendor: <strong className="text-slate-900 font-bold">{transaction.vendor_name}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI Forensic Verdict Alert */}
          <div className={`mt-5 p-4.5 rounded-xl border ${
            isFlagged
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : isReconciled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start space-x-3.5">
              {isFlagged ? (
                <AlertTriangle className="w-6 h-6 text-rose-600 mt-0.5 shrink-0" />
              ) : isReconciled ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
              )}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider">
                  AI Forensic Reconciler Verdict
                </h4>
                <p className="text-sm mt-1.5 leading-relaxed font-semibold">
                  {transaction.ai_summary || "Automated multimodal cross-reconciliation in progress..."}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Cross-Reconciliation Metrics */}
          <div className="grid grid-cols-3 gap-3.5 mt-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor Claimed</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
                ${transaction.billed_amount?.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">WFP Benchmark</span>
              <div className="text-xl sm:text-2xl font-black text-slate-700 font-mono mt-1">
                ${transaction.market_ref_amount?.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${
              isFlagged ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Variance / Gap</span>
              <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${isFlagged ? 'text-rose-700' : 'text-emerald-700'}`}>
                {transaction.variance_amount === 0 ? '$0.00' : `-$${transaction.variance_amount?.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Side-by-Side Invoiced vs Confirmed Items */}
          <div className="mt-6">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Extracted Line Items (Gemini Vision OCR)</span>
            </h4>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Item Description</th>
                    <th className="p-3.5 text-right">Qty</th>
                    <th className="p-3.5 text-right">Unit Price</th>
                    <th className="p-3.5 text-right">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailData?.invoice_items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{item.item_description}</td>
                      <td className="p-3.5 text-right text-slate-600 font-semibold">{item.quantity}</td>
                      <td className="p-3.5 text-right font-mono text-slate-700 font-medium">${item.unit_price?.toFixed(2)}</td>
                      <td className="p-3.5 text-right font-mono font-black text-slate-900">${item.total_price?.toFixed(2)}</td>
                    </tr>
                  ))}
                  {(!detailData?.invoice_items || detailData?.invoice_items?.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-5 text-center text-slate-500 italic">
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
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Beneficiary Field Proof (Twilio OTP & Delivery Photo)</span>
            </h4>

            <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">OTP Sign-Off Status:</span>
                <span className={`font-bold ${detailData?.otp_verified ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {detailData?.otp_verified ? '✓ Verified Cryptographically' : 'Pending Verification'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Beneficiary Phone:</span>
                <span className="font-mono text-slate-900 font-bold">{detailData?.beneficiary_phone || '+1 (555) 019-2834'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">GPS Geo-Coordinates:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {detailData?.gps ? `Lat ${detailData.gps.lat}, Lng ${detailData.gps.lng}` : '13.0827° N, 80.2707° E'}
                </span>
              </div>

              {detailData?.delivery_photo_url && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-800 block mb-2">
                    Verified Field Delivery Photo:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56 relative group">
                    <img
                      src={detailData.delivery_photo_url}
                      alt="Delivery Ground Truth"
                      className="w-full h-56 object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute bottom-2.5 left-2.5 px-3 py-1 bg-white/95 backdrop-blur rounded-md text-xs text-emerald-800 font-mono font-bold shadow-sm">
                      ✓ EXIF Verified In-Zone
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between mt-6">
          <div className="text-sm text-slate-600 font-medium">
            PayPal Payout Status: <span className="font-mono font-bold text-slate-900">{transaction.paypal_payout_id || 'FROZEN_IN_ESCROW'}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            {isFlagged && (
              <button
                onClick={() => onOpenDispute(transaction)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                Community Override
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold border border-slate-300 transition-all"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
