import React, { useState } from 'react';
import { X, Upload, CheckCircle, FileText } from 'lucide-react';
import { Campaign } from '../lib/types';
import { api } from '../lib/api';

interface SubmitClaimModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: (claimId: string) => void;
}

export const SubmitClaimModal: React.FC<SubmitClaimModalProps> = ({
  campaign,
  onClose,
  onSuccess
}) => {
  const [vendorName, setVendorName] = useState<string>('Apex Humanitarian Supplies Ltd');
  const [vendorEmail, setVendorEmail] = useState<string>('apex-vendor@example.com');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-2026-904');
  const [invoiceAmount, setInvoiceAmount] = useState<number>(1000);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('milestone_id', `MS-${campaign.id.substring(5, 10)}-01`);
      formData.append('vendor_name', vendorName);
      formData.append('vendor_paypal_email', vendorEmail);
      formData.append('invoice_number', invoiceNumber);
      formData.append('invoice_amount', invoiceAmount.toString());

      const res = await api.submitClaim(formData);
      onSuccess(res.claim_id);
    } catch (err) {
      console.error(err);
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

        <div className="flex items-center space-x-2 text-sky-400 mb-2">
          <FileText className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Vendor Milestone Claim</span>
        </div>

        <h3 className="text-xl font-bold text-white">
          Submit Invoice for {campaign.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          The Autonomous AI agent will extract line items via Gemini Vision and cross-check prices against WFP indexes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 my-6">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Contractor / Vendor Business Name
            </label>
            <input
              type="text"
              required
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Vendor PayPal Payout Email (Sandbox Recipient)
            </label>
            <input
              type="email"
              required
              value={vendorEmail}
              onChange={(e) => setVendorEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Total Billed Amount ($)
              </label>
              <input
                type="number"
                required
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Upload Dropzone */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Upload Invoice Receipt (PDF or Image)
            </label>
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-4 text-center cursor-pointer transition-all">
              <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
              <span className="text-xs text-slate-300 font-medium block">
                Click or drag invoice file here
              </span>
              <span className="text-[10px] text-slate-500">
                Supports PDF, PNG, JPG (Pre-loaded with sample demo invoices)
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Submitting & Indexing...' : 'Submit Claim to Autonomous Escrow'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
