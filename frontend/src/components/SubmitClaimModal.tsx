import React, { useState, useEffect } from 'react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    const milestoneMap: Record<string, string> = {
      'CAMP-FLOOD-01': 'MS-FLOOD-01',
      'CAMP-WATER-02': 'MS-WATER-02',
      'CAMP-TECH-03': 'MS-TECH-03'
    };
    setSelectedMilestoneId(milestoneMap[campaign.id] || campaign.id.replace('CAMP-', 'MS-'));

    api.getCampaignDetail(campaign.id)
      .then(res => {
        if (res.milestones && res.milestones.length > 0) {
          setMilestones(res.milestones);
          setSelectedMilestoneId(res.milestones[0].id);
        }
      })
      .catch(err => console.error(err));
  }, [campaign.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const milestoneMap: Record<string, string> = {
        'CAMP-FLOOD-01': 'MS-FLOOD-01',
        'CAMP-WATER-02': 'MS-WATER-02',
        'CAMP-TECH-03': 'MS-TECH-03'
      };
      const targetMilestone = selectedMilestoneId || milestoneMap[campaign.id] || campaign.id.replace('CAMP-', 'MS-');

      const formData = new FormData();
      formData.append('milestone_id', targetMilestone);
      formData.append('vendor_name', vendorName);
      formData.append('vendor_paypal_email', vendorEmail);
      formData.append('invoice_number', invoiceNumber);
      formData.append('invoice_amount', invoiceAmount.toString());
      if (selectedFile) {
        formData.append('invoice_file', selectedFile);
      }

      const res = await api.submitClaim(formData);
      onSuccess(res.claim_id);
    } catch (err) {
      console.error(err);
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

        <div className="flex items-center space-x-2 text-sky-700 mb-2.5">
          <FileText className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Vendor Milestone Claim</span>
        </div>

        <h3 className="text-2xl font-black text-slate-900">
          Submit Invoice for {campaign.title}
        </h3>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          The Autonomous AI agent will extract line items via Gemini Vision and cross-check prices against WFP indexes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4.5 my-6">
          <div>
            <label className="text-sm text-slate-800 font-bold block mb-1.5">
              Contractor / Vendor Business Name
            </label>
            <input
              type="text"
              required
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="text-sm text-slate-800 font-bold block mb-1.5">
              Vendor PayPal Payout Email (Sandbox Recipient)
            </label>
            <input
              type="email"
              required
              value={vendorEmail}
              onChange={(e) => setVendorEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-sm text-slate-800 font-bold block mb-1.5">
                Invoice Number
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-sm text-slate-800 font-bold block mb-1.5">
                Total Billed Amount ($)
              </label>
              <input
                type="number"
                required
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-mono font-bold"
              />
            </div>
          </div>

          {/* Upload Dropzone */}
          <div>
            <label className="text-sm text-slate-800 font-bold block mb-1.5">
              Upload Invoice Receipt (PDF or Image)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
            >
              <Upload className={`w-7 h-7 mx-auto mb-1.5 ${selectedFile ? 'text-emerald-600' : 'text-slate-400'}`} />
              {selectedFile ? (
                <div>
                  <span className="text-sm text-emerald-800 font-bold block">
                    ✓ {selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click to replace file
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-sm text-slate-800 font-semibold block">
                    Click to select invoice file
                  </span>
                  <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                    Supports PDF, PNG, JPG (Or leave empty to use sample invoice)
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Submitting & Indexing...' : 'Submit Claim to Autonomous Escrow'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
