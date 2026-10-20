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

  // Status Badge Cell Renderer
  const StatusCellRenderer = (params: any) => {
    const status = params.value;
    if (status === 'RECONCILED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 shadow-sm shadow-emerald-950">
          <span className="relative flex h-1.5 w-1.5 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          100% Reconciled
        </span>
      );
    } else if (status === 'FLAGGED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/90 text-red-300 border border-red-700/80 shadow-sm shadow-red-950">
          <span className="relative flex h-1.5 w-1.5 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
          </span>
          Flagged Discrepancy
        </span>
      );
    } else if (status === 'OVERRIDDEN') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/90 text-blue-300 border border-blue-700/80 shadow-sm">
          <ShieldCheck className="w-3 h-3 mr-1 text-blue-400" />
          Community Override
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-700/80 shadow-sm">
          <Clock className="w-3 h-3 mr-1 text-amber-400" />
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
        <div className="flex items-center space-x-1">
          <span className="font-semibold text-emerald-400 text-xs font-mono">$0.00</span>
          <span className="text-[10px] text-emerald-500/80 font-normal">(Match)</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-center py-1">
        <span className="font-bold text-red-400 text-xs font-mono">
          -${Math.abs(variance || 0).toFixed(2)}
        </span>
        {inflation > 0 && (
          <span className="text-[10px] text-red-300 font-medium">
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
      <div className="flex items-center space-x-1.5 h-full">
        <button
          onClick={() => onSelectTransaction(tx)}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white rounded-lg text-xs font-medium flex items-center space-x-1 border border-slate-700/80 transition-all shadow-sm active:scale-95"
          title="Inspect side-by-side invoice vs photo proof"
        >
          <Eye className="w-3 h-3" />
          <span>Inspect</span>
        </button>

        {tx.status === 'FLAGGED' && (
          <button
            onClick={() => onOpenDispute(tx)}
            className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white rounded-lg text-xs font-medium border border-red-800 transition-all shadow-sm active:scale-95"
            title="Request human community override"
          >
            Override
          </button>
        )}
      </div>
    );
  };

  // AG Grid Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Tx ID',
      field: 'id',
      width: 140,
      cellRenderer: (p: any) => (
        <span className="font-mono text-xs font-bold text-sky-400">{p.value}</span>
      )
    },
    {
      headerName: 'Grant Project',
      field: 'campaign_title',
      width: 230,
      cellRenderer: (p: any) => (
        <div>
          <div className="font-medium text-xs text-white truncate">{p.value}</div>
          <div className="text-[11px] text-slate-400 truncate">{p.data.milestone_title}</div>
        </div>
      )
    },
    {
      headerName: 'Vendor',
      field: 'vendor_name',
      width: 180,
      cellRenderer: (p: any) => (
        <span className="text-xs text-slate-300 truncate font-medium">{p.value}</span>
      )
    },
    {
      headerName: 'Billed ($)',
      field: 'billed_amount',
      width: 110,
      cellRenderer: (p: any) => (
        <span className="font-mono text-xs font-semibold text-slate-200">
          ${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      headerName: 'WFP Benchmark',
      field: 'market_ref_amount',
      width: 130,
      cellRenderer: (p: any) => (
        <span className="font-mono text-xs text-slate-400">
          ${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      headerName: 'Confirmed Value',
      field: 'confirmed_amount',
      width: 130,
      cellRenderer: (p: any) => (
        <span className="font-mono text-xs text-emerald-400 font-medium">
          ${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      headerName: 'Discrepancy',
      field: 'variance_amount',
      width: 130,
      cellRenderer: VarianceCellRenderer,
      enableCellChangeFlash: true
    },
    {
      headerName: 'Audit Status',
      field: 'status',
      width: 175,
      cellRenderer: StatusCellRenderer,
      enableCellChangeFlash: true
    },
    {
      headerName: 'PayPal Batch',
      field: 'paypal_payout_id',
      width: 140,
      cellRenderer: (p: any) => (
        <span className={`font-mono text-[11px] font-semibold ${
          p.data.status === 'FLAGGED' ? 'text-red-400' : p.value ? 'text-emerald-400' : 'text-slate-400'
        }`}>
          {p.value || (p.data.status === 'FLAGGED' ? 'FROZEN_ESCROW' : 'HELD_PENDING')}
        </span>
      )
    },
    {
      headerName: 'Actions',
      width: 160,
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
    'border-l-4 border-l-red-500 bg-red-950/10': (p: any) => p.data.status === 'FLAGGED',
    'border-l-4 border-l-emerald-500 bg-emerald-950/10': (p: any) => p.data.status === 'RECONCILED',
    'border-l-4 border-l-amber-500 bg-amber-950/10': (p: any) => p.data.status === 'PENDING'
  }), []);

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-2xl mb-8 border border-white/10 relative">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Live Audited Ledger
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-950 text-sky-400 border border-sky-800 shadow-sm flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AG GRID REACT v31</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time forensic surveillance of community relief disbursements and fraud freezes.
          </p>
        </div>

        {/* Filter Pills & Export */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('FLAGGED')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'FLAGGED'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-red-400 hover:text-white'
              }`}
            >
              Flagged ({counts.flagged})
            </button>
            <button
              onClick={() => setStatusFilter('RECONCILED')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'RECONCILED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-white'
              }`}
            >
              Reconciled ({counts.reconciled})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:text-white'
              }`}
            >
              Pending ({counts.pending})
            </button>
          </div>

          <a
            href={api.exportCSVUrl}
            download
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white rounded-xl border border-white/10 transition-all shadow-sm active:scale-95"
            title="Download full audit ledger as forensic CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </a>
        </div>
      </div>

      {/* Quick Search Input */}
      <div className="mb-3.5 relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={quickFilterText}
          onChange={(e) => setQuickFilterText(e.target.value)}
          placeholder="Search by grant, vendor, status, or transaction ID..."
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
        />
      </div>

      {/* AG Grid Component */}
      <div className="ag-theme-alpine-dark w-full h-[460px] shadow-2xl">
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
