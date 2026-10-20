import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, AlertOctagon, Scale } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-red-400 mb-2">
          <Scale className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Human-in-the-Loop Governance</span>
        </div>

        <h3 className="text-xl font-bold text-white">
          Review Discrepancy & Dispute
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          The AI Discrepancy Engine blocked this transaction for ${transaction.variance_amount?.toFixed(2)}. Community organizers can review contractor justifications.
        </p>

        {/* Flag Summary Box */}
        <div className="my-5 p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl text-xs space-y-1.5">
          <div className="font-bold text-red-300 flex items-center space-x-1.5">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
            <span>AI Forensic Audit Alert:</span>
          </div>
          <p className="text-red-200/90 leading-relaxed pl-5">
            {transaction.ai_summary}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Authorized Community Administrator Name
            </label>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Documented Justification / Context
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              This note will be permanently committed to the AG Grid audited ledger for donor inspection.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() => handleAction('APPROVE')}
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve & Release via PayPal Payouts</span>
            </button>

            <button
              onClick={() => handleAction('REJECT')}
              disabled={loading}
              className="px-4 py-2.5 bg-red-950 hover:bg-red-900 text-red-300 font-bold text-xs rounded-xl border border-red-800 transition-all"
            >
              Uphold Freeze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
