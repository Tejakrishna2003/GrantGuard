import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, RowClassRules } from 'ag-grid-community';
import { Download, Search, Eye, AlertOctagon, Filter, ShieldCheck, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { LedgerTransaction } from '../lib/types';
import { api } from '../lib/api';

interface AuditedLedgerGridProps {
  transactions: LedgerTransaction[];
  onSelectTransaction: (tx: LedgerTransaction) => void;
  onOpenDispute: (tx: LedgerTransaction) => void;
}

export const AuditedLedgerGrid: React.FC<AuditedLedgerGridProps> = ({
  transactions,
  onSelectTransaction,
  onOpenDispute
}) => {
  const [quickFilterText, setQuickFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredData = useMemo(() => {
    if (statusFilter === 'ALL') return transactions;
    return transactions.filter(t => t.status === statusFilter);
  }, [transactions, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: transactions.length,
      flagged: transactions.filter(t => t.status === 'FLAGGED').length,
      reconciled: transactions.filter(t => t.status === 'RECONCILED').length,
      pending: transactions.filter(t => t.status === 'PENDING').length,
    };
  }, [transactions]);

  // Status Badge Cell Renderer (Larger, High-Legibility)
  const StatusCellRenderer = (params: any) => {
    const status = params.value;
    if (status === 'RECONCILED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          100% Reconciled
        </span>
      );
    } else if (status === 'FLAGGED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
          </span>
          Flagged Discrepancy
        </span>
      );
    } else if (status === 'OVERRIDDEN') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          Community Override
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
          Pending OTP Proof
        </span>
      );
    }
  };

  // Variance & Markup Cell Renderer
  const VarianceCellRenderer = (params: any) => {
    const variance = params.value;
    const inflation = params.data.inflation_pct;

    if (variance === 0 && inflation === 0) {
      return (
        <div className="flex items-center space-x-1.5">
          <span className="font-black text-emerald-700 text-sm font-mono">$0.00</span>
          <span className="text-xs text-emerald-600 font-semibold">(Match)</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-center py-1">
        <span className="font-black text-rose-700 text-sm font-mono leading-tight">
          -${Math.abs(variance || 0).toFixed(2)}
        </span>
        {inflation > 0 && (
          <span className="text-xs text-rose-800 font-bold leading-tight">
            +{inflation.toFixed(1)}% Markup
          </span>
        )}
      </div>
    );
  };

  // Actions Cell Renderer
  const ActionCellRenderer = (params: any) => {
    const tx = params.data;
    return (
      <div className="flex items-center space-x-2 h-full">
        <button
          onClick={() => onSelectTransaction(tx)}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold flex items-center space-x-1.5 border border-slate-300 transition-all shadow-sm active:scale-95"
          title="Inspect side-by-side invoice vs photo proof"
        >
          <Eye className="w-3.5 h-3.5 text-sky-600" />
          <span>Inspect</span>
        </button>

        {tx.status === 'FLAGGED' && (
          <button
            onClick={() => onOpenDispute(tx)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold border border-rose-200 transition-all shadow-sm active:scale-95"
            title="Request human community override"
          >
            Override
          </button>
        )}
      </div>
    );
  };

  // AG Grid Column Definitions with Larger Dimensions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Tx ID',
      field: 'id',
      width: 150,
      cellRenderer: (p: any) => (
        <span className="font-mono text-sm font-bold text-slate-900">{p.value}</span>
      )
    },
    {
      headerName: 'Grant Project',
      field: 'campaign_title',
      width: 250,
      cellRenderer: (p: any) => (
        <div className="py-1">
          <div className="font-bold text-sm text-slate-900 truncate leading-snug">{p.value}</div>
          <div className="text-xs text-slate-500 truncate leading-snug font-medium">{p.data.milestone_title}</div>
        </div>
      )
    },
    {
      headerName: 'Vendor',
      field: 'vendor_name',
      width: 200,
      cellRenderer: (p: any) => (
        <span className="text-sm text-slate-800 truncate font-semibold">{p.value}</span>
      )
    },
    {
      headerName: 'Billed ($)',
      field: 'billed_amount',
      width: 120,
      cellRenderer: (p: any) => (
        <span className="font-mono text-sm font-black text-slate-900">
          ${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      headerName: 'WFP Benchmark',
      field: 'market_ref_amount',
      width: 140,
      cellRenderer: (p: any) => (
        <span className="font-mono text-sm text-slate-600 font-semibold">
          ${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      headerName: 'Confirmed Value',
      field: 'confirmed_amount',
      width: 140,
      cellRenderer: (p: any) => (
        <span className="font-mono text-sm text-emerald-700 font-black">
          ${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      headerName: 'Discrepancy',
      field: 'variance_amount',
      width: 145,
      cellRenderer: VarianceCellRenderer,
      enableCellChangeFlash: true
    },
    {
      headerName: 'Audit Status',
      field: 'status',
      width: 185,
      cellRenderer: StatusCellRenderer,
      enableCellChangeFlash: true
    },
    {
      headerName: 'PayPal Batch',
      field: 'paypal_payout_id',
      width: 155,
      cellRenderer: (p: any) => (
        <span className={`font-mono text-xs font-bold ${
          p.data.status === 'FLAGGED' ? 'text-rose-700' : p.value ? 'text-emerald-700' : 'text-slate-500'
        }`}>
          {p.value || (p.data.status === 'FLAGGED' ? 'FROZEN_ESCROW' : 'HELD_PENDING')}
        </span>
      )
    },
    {
      headerName: 'Actions',
      width: 175,
      cellRenderer: ActionCellRenderer,
      pinned: 'right'
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true
  }), []);

  const rowClassRules: RowClassRules = useMemo(() => ({
    'border-l-4 border-l-rose-500 bg-rose-50/30': (p: any) => p.data.status === 'FLAGGED',
    'border-l-4 border-l-emerald-500 bg-emerald-50/30': (p: any) => p.data.status === 'RECONCILED',
    'border-l-4 border-l-amber-500 bg-amber-50/30': (p: any) => p.data.status === 'PENDING'
  }), []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm mb-8">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Live Audited Ledger
            </h2>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-sky-50 text-sky-800 border border-sky-200 flex items-center space-x-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-sky-600" />
              <span>AG GRID REACT v31</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Real-time forensic surveillance of community relief disbursements and fraud freezes.
          </p>
        </div>

        {/* Filter Pills & Export */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-sm">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('FLAGGED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'FLAGGED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 hover:text-rose-900 hover:bg-white'
              }`}
            >
              Flagged ({counts.flagged})
            </button>
            <button
              onClick={() => setStatusFilter('RECONCILED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'RECONCILED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:text-emerald-900 hover:bg-white'
              }`}
            >
              Reconciled ({counts.reconciled})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-700 hover:text-amber-900 hover:bg-white'
              }`}
            >
              Pending ({counts.pending})
            </button>
          </div>

          <a
            href={api.exportCSVUrl}
            download
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 hover:text-slate-900 rounded-xl border border-slate-300 transition-all shadow-sm active:scale-95"
            title="Download full audit ledger as forensic CSV"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </a>
        </div>
      </div>

      {/* Quick Search Input */}
      <div className="mb-4 relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={quickFilterText}
          onChange={(e) => setQuickFilterText(e.target.value)}
          placeholder="Search by grant, vendor, status, or transaction ID..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-medium"
        />
      </div>

      {/* AG Grid Component in Clean Alpine Light Mode */}
      <div className="ag-theme-alpine w-full h-[500px] shadow-sm">
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          rowClassRules={rowClassRules}
          enableCellChangeFlash={true}
          animateRows={true}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
};
