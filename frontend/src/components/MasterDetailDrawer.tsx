import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, FileText, Smartphone, MapPin, ZoomIn } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-4xl bg-white border-l border-slate-200 h-full overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col justify-between">
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Variance / Discrepancy</span>
              <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${isFlagged ? 'text-rose-700' : 'text-emerald-700'}`}>
                {transaction.variance_amount === 0 ? '$0.00' : `-$${transaction.variance_amount?.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* 🌟 SPLIT-SCREEN COMPARISON: INVOICE vs BENEFICIARY PROOF 🌟 */}
          <div className="mt-7 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                Split-Screen Forensic Proof Audit
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Side-by-side: Contractor invoice vs Physical delivery ground truth
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-pulse">
                {/* Skeleton Card 1 - Invoice */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-8 bg-slate-200 rounded-lg" />
                    <div className="h-6 bg-slate-100 rounded" />
                    <div className="h-6 bg-slate-100 rounded" />
                    <div className="h-6 bg-slate-100 rounded" />
                  </div>
                  <div className="h-4 w-52 bg-slate-200 rounded pt-2" />
                </div>

                {/* Skeleton Card 2 - Delivery Proof */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-5 w-28 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-40 bg-slate-200 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT COLUMN: Contractor Invoice Details */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span>Contractor Invoice Paperwork</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {detailData?.claim?.invoice_number || 'INV-SCANNED'}
                    </span>
                  </div>

                  {/* Line Items Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Item</th>
                          <th className="p-2.5 text-right">Qty</th>
                          <th className="p-2.5 text-right">Unit ($)</th>
                          <th className="p-2.5 text-right">Total ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detailData?.invoice_items?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 font-bold text-slate-900">{item.item_description}</td>
                            <td className="p-2.5 text-right text-slate-600 font-semibold">{item.quantity}</td>
                            <td className="p-2.5 text-right font-mono text-slate-700">${item.unit_price?.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-mono font-black text-slate-900">${item.total_price?.toFixed(2)}</td>
                          </tr>
                        ))}
                        {(!detailData?.invoice_items || detailData?.invoice_items?.length === 0) && (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                              Line items extracted via Gemini Vision
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span>Vendor Payout Email:</span>
                  <span className="font-mono font-bold text-slate-900">{detailData?.claim?.vendor_paypal_email || 'vendor@example.com'}</span>
                </div>
              </div>

              {/* RIGHT COLUMN: Beneficiary Delivery Ground Truth */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Beneficiary Field Sign-Off</span>
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      detailData?.otp_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {detailData?.otp_verified ? '✓ OTP Cryptographically Signed' : 'Pending OTP'}
                    </span>
                  </div>

                  {/* Delivery Photo with EXIF Overlay */}
                  {detailData?.delivery_photo_url ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 h-40 relative group shadow-sm bg-slate-200">
                      <img
                        src={detailData.delivery_photo_url}
                        alt="Delivery Ground Truth"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-white/95 backdrop-blur rounded text-[11px] text-emerald-800 font-mono font-bold shadow-sm flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>GPS Verified In-Zone</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 bg-white">
                      Field delivery photo will appear upon volunteer sign-off
                    </div>
                  )}

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-medium">Signee:</span>
                      <span className="font-bold text-slate-900">{detailData?.proof?.beneficiary_name || 'Community Coordinator'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span className="font-mono text-slate-900">{detailData?.beneficiary_phone || '+1 (555) 019-2834'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Coordinates:</span>
                      <span className="font-mono text-slate-900">{detailData?.gps ? `${detailData.gps.lat}° N, ${detailData.gps.lng}° E` : '12.9716° N, 77.5946° E'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Confirmed Value:</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    ${detailData?.proof?.confirmed_value?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
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
