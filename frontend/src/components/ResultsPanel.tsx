import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, AlertTriangle, Clock, X, ChevronRight, ListChecks } from 'lucide-react';

export type ResultKind = 'success' | 'fraud' | 'warning' | 'pending';

export interface ScenarioResult {
  claimId: string;
  scenario: string; // e.g. "Fraud Catch"
  kind: ResultKind;
  title: string;
  message: string;
  batchId?: string;
  time: string;
}

interface ResultsPanelProps {
  results: ScenarioResult[];
  onDismiss: (claimId: string) => void;
  onClearAll: () => void;
}

const STYLE: Record<ResultKind, { border: string; bg: string; text: string; icon: React.ReactNode }> = {
  success: { border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-900', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
  fraud: { border: 'border-rose-300', bg: 'bg-rose-50', text: 'text-rose-900', icon: <ShieldAlert className="w-4 h-4 text-rose-600" /> },
  warning: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-900', icon: <AlertTriangle className="w-4 h-4 text-amber-600" /> },
  pending: { border: 'border-sky-300', bg: 'bg-sky-50', text: 'text-sky-900', icon: <Clock className="w-4 h-4 text-sky-600" /> },
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, onDismiss, onClearAll }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (results.length === 0) return null;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-20 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xl hover:bg-slate-800 transition-colors"
      >
        <ListChecks className="w-4 h-4" />
        <span>{results.length} scenario result{results.length > 1 ? 's' : ''}</span>
      </button>
    );
  }

  return (
    <aside className="fixed top-20 right-4 z-50 w-[calc(100%-2rem)] max-w-xs max-h-[calc(100vh-6rem)] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <span className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <ListChecks className="w-4 h-4 text-sky-600" />
          <span>Scenario Results ({results.length})</span>
        </span>
        <div className="flex items-center space-x-1">
          <button onClick={onClearAll} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100">
            Clear all
          </button>
          <button onClick={() => setCollapsed(true)} title="Collapse" className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-3 space-y-2.5">
        {results.map((r) => {
          const s = STYLE[r.kind];
          return (
            <div key={r.claimId} className={`rounded-xl border ${s.border} ${s.bg} p-3`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className="mt-0.5">{s.icon}</div>
                  <div>
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      {r.scenario} · {r.claimId}
                    </div>
                    <h5 className={`text-sm font-bold leading-snug mt-0.5 ${s.text}`}>{r.title}</h5>
                  </div>
                </div>
                <button onClick={() => onDismiss(r.claimId)} title="Close" className="text-slate-400 hover:text-slate-900 p-0.5 shrink-0 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">{r.message}</p>
              {r.batchId && (
                <div className="mt-2 text-[11px] font-mono bg-white/70 px-2 py-0.5 rounded border border-slate-200 inline-block text-slate-700">
                  PayPal Batch: {r.batchId}
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-2 font-mono">{r.time}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
