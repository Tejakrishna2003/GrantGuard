import React, { useState } from 'react';
import { X, CheckCircle, AlertOctagon, Scale } from 'lucide-react';
import { LedgerTransaction } from '../lib/types';
import { api } from '../lib/api';

interface DisputeModalProps {
  transaction: LedgerTransaction;
  onClose: () => void;
  onSuccess: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  transaction,
  onClose,
  onSuccess
}) => {
  const [organizerName, setOrganizerName] = useState<string>('Sarah Jenkins (Community Fund Administrator)');
  const [justification, setJustification] = useState<string>('Emergency road washout caused 40% transport fuel surcharge on delivery trucks.');
  const [loading, setLoading] = useState<boolean>(false);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    setLoading(true);
    try {
      await api.overrideDispute(transaction.id, organizerName, justification, action);
      onSuccess();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-7 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-rose-700 mb-2.5">
          <Scale className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Human-in-the-Loop Governance</span>
        </div>

        <h3 className="text-2xl font-black text-slate-900">
          Review Discrepancy & Dispute
        </h3>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          The AI Discrepancy Engine blocked this transaction for ${transaction.variance_amount?.toFixed(2)}. Community organizers can review contractor justifications.
        </p>

        {/* Flag Summary Box */}
        <div className="my-5 p-4.5 bg-rose-50 border border-rose-200 rounded-2xl text-sm space-y-2">
          <div className="font-bold text-rose-800 flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm">AI Forensic Audit Alert:</span>
          </div>
          <p className="text-rose-900 leading-relaxed pl-7 font-medium text-sm">
            {transaction.ai_summary}
          </p>
        </div>

        <div className="space-y-4.5">
          <div>
            <label className="text-sm text-slate-800 font-bold block mb-1.5">
              Authorized Community Administrator Name
            </label>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="text-sm text-slate-800 font-bold block mb-1.5">
              Documented Justification / Context
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 leading-relaxed font-medium"
            />
            <span className="text-xs text-slate-500 block mt-1 font-medium">
              This note will be permanently committed to the AG Grid audited ledger for donor inspection.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() => handleAction('APPROVE')}
              disabled={loading}
              className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve & Release via PayPal Payouts</span>
            </button>

            <button
              onClick={() => handleAction('REJECT')}
              disabled={loading}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 transition-all"
            >
              Uphold Freeze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
