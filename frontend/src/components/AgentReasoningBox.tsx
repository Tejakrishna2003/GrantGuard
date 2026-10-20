import React, { useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AgentThought } from '../lib/types';

interface AgentReasoningBoxProps {
  logs: AgentThought[];
  isStreaming: boolean;
  activeClaimId?: string;
}

export const AgentReasoningBox: React.FC<AgentReasoningBoxProps> = ({
  logs,
  isStreaming,
  activeClaimId
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl mb-6 overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 ml-2 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Autonomous Cognitive Reasoning Stream</span>
          </span>
          {activeClaimId && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
              {activeClaimId}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isStreaming ? (
            <span className="flex items-center space-x-1.5 text-[11px] text-sky-400 font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>RECONCILING LIVE...</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono">
              ENGINE IDLE • STANDBY FOR CLAIMS
            </span>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="font-mono text-xs max-h-56 overflow-y-auto space-y-2 pr-2 leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-4 text-center">
            Click one of the "Live Demo" scenario buttons above or submit a milestone claim to trigger the AI agent.
          </div>
        ) : (
          logs.map((log, index) => {
            let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
            let icon = <ArrowRight className="w-3 h-3 text-sky-400" />;

            if (log.type === 'ALERT') {
              badgeBg = 'bg-red-950 text-red-400 border-red-800 font-bold';
              icon = <AlertTriangle className="w-3 h-3 text-red-400" />;
            } else if (log.type === 'DECIDE') {
              badgeBg = 'bg-purple-950 text-purple-300 border-purple-800 font-bold';
              icon = <CheckCircle2 className="w-3 h-3 text-purple-400" />;
            } else if (log.type === 'ACTION') {
              badgeBg = 'bg-emerald-950 text-emerald-300 border-emerald-800 font-bold';
              icon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
            }

            return (
              <div key={index} className="flex items-start space-x-2 animate-fadeIn">
                <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                  [{log.timestamp}]
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase border shrink-0 ${badgeBg}`}>
                  {log.type}
                </span>
                <p className="text-slate-200 break-words flex-1">
                  {log.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
