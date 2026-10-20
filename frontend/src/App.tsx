import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { AuditedLedgerGrid } from './components/AuditedLedgerGrid';
import { AgentReasoningBox } from './components/AgentReasoningBox';
import { FundingProgressChart } from './components/FundingProgressChart';
import { CampaignHero } from './components/CampaignHero';
import { MasterDetailDrawer } from './components/MasterDetailDrawer';
import { SubmitClaimModal } from './components/SubmitClaimModal';
import { VerifyProofModal } from './components/VerifyProofModal';
import { DisputeModal } from './components/DisputeModal';
import { Campaign, LedgerTransaction, GlobalMetrics, AgentThought } from './lib/types';
import { api, API_BASE } from './lib/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ledger');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);

  // Modals & Drawers
  const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);
  const [disputeTx, setDisputeTx] = useState<LedgerTransaction | null>(null);
  const [claimCampaign, setClaimCampaign] = useState<Campaign | null>(null);
  const [verifyCampaign, setVerifyCampaign] = useState<Campaign | null>(null);

  // Live Agent SSE Streaming State
  const [agentLogs, setAgentLogs] = useState<AgentThought[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeClaimId, setActiveClaimId] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    loadData();
  }, []);

  // Trigger live SSE agent loop for any claim (e.g. Scenarios 1, 2, 3)
  const triggerAgentReconciliation = (claimId: string) => {
    setIsStreaming(true);
    setActiveClaimId(claimId);
    setAgentLogs([]);
    setActiveTab('ledger'); // switch to ledger tab so judge sees AG Grid and terminal

    const eventSource = new EventSource(`${API_BASE}/agent/stream/${claimId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'COMPLETE') {
          setIsStreaming(false);
          eventSource.close();
          loadData(); // refresh AG Grid and KPIs
        } else {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {!backendConnected && (
        <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs text-center font-medium flex items-center justify-center space-x-2">
          <span>⚠️ Backend offline or unreachable at port 8000. Run:</span>
          <code className="bg-amber-900 px-2 py-0.5 rounded font-mono text-white">
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
        systemStatus={systemStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards (Always visible for high-level visibility) */}
        <KPICards metrics={metrics} />

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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>GrantPool AI</strong> — Built for the <strong>PayPal AI Hackathon 2026</strong>.
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">PayPal Donations & Payouts</span>
            <span>•</span>
            <span className="text-slate-400">AG Grid React Community</span>
            <span>•</span>
            <span className="text-slate-400">Gemini 2.0 Flash</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">
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
