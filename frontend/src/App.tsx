import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { HowItWorksStrip } from './components/HowItWorksStrip';
import { AuditedLedgerGrid } from './components/AuditedLedgerGrid';
import { AgentReasoningBox } from './components/AgentReasoningBox';
import { FundingProgressChart } from './components/FundingProgressChart';
import { CampaignHero } from './components/CampaignHero';
import { MasterDetailDrawer } from './components/MasterDetailDrawer';
import { SubmitClaimModal } from './components/SubmitClaimModal';
import { VerifyProofModal } from './components/VerifyProofModal';
import { DisputeModal } from './components/DisputeModal';
import { ToastContainer, ToastNotification } from './components/ToastContainer';
import { Campaign, LedgerTransaction, GlobalMetrics, AgentThought } from './lib/types';
import { api, API_BASE } from './lib/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ledger');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Policy Tolerance Mode: NORMAL (10%) or CRISIS (35%)
  const [toleranceMode, setToleranceMode] = useState<'NORMAL' | 'CRISIS'>('NORMAL');

  // Modals & Drawers
  const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);
  const [disputeTx, setDisputeTx] = useState<LedgerTransaction | null>(null);
  const [claimCampaign, setClaimCampaign] = useState<Campaign | null>(null);
  const [verifyCampaign, setVerifyCampaign] = useState<Campaign | null>(null);

  // Live Agent SSE Streaming State
  const [agentLogs, setAgentLogs] = useState<AgentThought[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeClaimId, setActiveClaimId] = useState<string | undefined>(undefined);
  const [activePipelineStep, setActivePipelineStep] = useState<number | undefined>(undefined);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = async () => {
    try {
      const [camps, txs, mets, sys] = await Promise.all([
        api.getCampaigns(),
        api.getLedger(),
        api.getMetrics(),
        api.getSystemStatus().catch(() => null)
      ]);
      setCampaigns(camps);
      setTransactions(txs);
      setMetrics(mets);
      setSystemStatus(sys);
      setBackendConnected(true);
    } catch (e) {
      console.error('Failed to load initial data:', e);
      setBackendConnected(false);
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      await api.resetDatabase();
      await loadData();
      setAgentLogs([]);
      setActiveClaimId(undefined);
      setActivePipelineStep(undefined);
      addToast({
        type: 'INFO',
        title: 'Demo State Reset',
        message: 'SQLite database reset to clean 3 initial pre-seeded scenarios.'
      });
    } catch (e) {
      console.error('Reset failed:', e);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Trigger live SSE agent loop for any claim (e.g. Scenarios 1, 2, 3)
  const triggerAgentReconciliation = (claimId: string) => {
    setIsStreaming(true);
    setActiveClaimId(claimId);
    setAgentLogs([]);
    setActiveTab('ledger'); // switch to ledger tab so judge sees AG Grid and terminal

    const toleranceParam = toleranceMode === 'CRISIS' ? 35.0 : 10.0;
    const eventSource = new EventSource(`${API_BASE}/agent/stream/${claimId}?tolerance=${toleranceParam}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'COMPLETE') {
          setIsStreaming(false);
          eventSource.close();
          loadData(); // refresh AG Grid and KPIs

          // Trigger toast notification
          if (data.status === 'RECONCILED') {
            addToast({
              type: 'PAYPAL_PAYOUT',
              title: 'Autonomous PayPal Payout Executed',
              message: `Milestone verified 100%. Payout batch released.`,
              batchId: data.payout_id || 'GP-PAYOUT-8902B1'
            });
          } else if (data.status === 'FLAGGED') {
            addToast({
              type: 'FRAUD_HALT',
              title: 'Payout Halted & Capital Frozen',
              message: `AI detected price inflation or short delivery. Protected $${data.protected || 600} in escrow.`
            });
          }
        } else {
          setActivePipelineStep(data.step);
          setAgentLogs((prev) => [
            ...prev,
            {
              step: data.step,
              type: data.type,
              message: data.message,
              timestamp: data.timestamp
            }
          ]);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      setIsStreaming(false);
      eventSource.close();
      loadData();
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {!backendConnected && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs text-center font-medium flex items-center justify-center space-x-2">
          <span>⚠️ Backend offline or unreachable at port 8000. Run:</span>
          <code className="bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-mono text-amber-900">
            cd backend && .\venv\Scripts\uvicorn app.main:app --port 8000
          </code>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={loadData}
        onTriggerScenario={triggerAgentReconciliation}
        isStreaming={isStreaming}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards (Always visible for high-level visibility) */}
        <KPICards metrics={metrics} />

        {/* 🌟 NEW: Interactive 4-Way Reconciliation Architecture Flow Strip 🌟 */}
        <HowItWorksStrip activeStep={activePipelineStep} />

        {/* Live Autonomous Agent Reasoning Stream Terminal */}
        <AgentReasoningBox
          logs={agentLogs}
          isStreaming={isStreaming}
          activeClaimId={activeClaimId}
        />

        {/* View Switcher: Campaigns vs AG Grid Ledger */}
        {activeTab === 'campaigns' ? (
          <CampaignHero
            campaigns={campaigns}
            onDonateSuccess={loadData}
            onOpenClaimModal={(camp) => setClaimCampaign(camp)}
            onOpenVerifyModal={(camp) => setVerifyCampaign(camp)}
          />
        ) : (
          <div>
            <AuditedLedgerGrid
              transactions={transactions}
              onSelectTransaction={(tx) => setSelectedTx(tx)}
              onOpenDispute={(tx) => setDisputeTx(tx)}
            />

            <FundingProgressChart campaigns={campaigns} />
          </div>
        )}
      </main>

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-900 font-bold">GrantPool AI</strong> — Built for the <strong className="text-slate-900 font-bold">PayPal AI Hackathon 2026</strong>.
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-600 font-medium">PayPal Donations & Payouts</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">AG Grid React Community</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">Gemini 2.0 Flash</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold">
              Open Source (MIT)
            </span>
          </div>
        </div>
      </footer>

      {/* Slide-out Master-Detail Inspection Drawer */}
      {selectedTx && (
        <MasterDetailDrawer
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onOpenDispute={(tx) => {
            setSelectedTx(null);
            setDisputeTx(tx);
          }}
        />
      )}

      {/* Human-in-the-Loop Dispute Override Modal */}
      {disputeTx && (
        <DisputeModal
          transaction={disputeTx}
          onClose={() => setDisputeTx(null)}
          onSuccess={() => {
            setDisputeTx(null);
            loadData();
          }}
        />
      )}

      {/* Vendor Invoice Claim Modal */}
      {claimCampaign && (
        <SubmitClaimModal
          campaign={claimCampaign}
          onClose={() => setClaimCampaign(null)}
          onSuccess={(claimId) => {
            setClaimCampaign(null);
            triggerAgentReconciliation(claimId);
          }}
        />
      )}

      {/* Beneficiary Verification Modal */}
      {verifyCampaign && (
        <VerifyProofModal
          campaign={verifyCampaign}
          onClose={() => setVerifyCampaign(null)}
          onSuccess={() => {
            setVerifyCampaign(null);
            const claimMap: Record<string, string> = {
              'CAMP-FLOOD-01': 'CLM-FLOOD-01',
              'CAMP-WATER-02': 'CLM-WATER-02',
              'CAMP-TECH-03': 'CLM-TECH-03'
            };
            const claimId = claimMap[verifyCampaign.id] || verifyCampaign.id.replace('CAMP-', 'CLM-');
            triggerAgentReconciliation(claimId);
          }}
        />
      )}
    </div>
  );
};
