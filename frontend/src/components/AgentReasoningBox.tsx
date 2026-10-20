import React, { useEffect, useRef, useMemo } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ArrowRight, Activity, ShieldAlert, Sparkles, Lock, FileSearch, Scale, Smartphone, Send } from 'lucide-react';
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

  // Derive pipeline step statuses from the stream logs
  const pipelineState = useMemo(() => {
    const hasLog = (substr: string) => logs.some(l => l.message.toLowerCase().includes(substr.toLowerCase()));
    const hasAlert = (substr: string) => logs.some(l => l.type === 'ALERT' && l.message.toLowerCase().includes(substr.toLowerCase()));

    const step1 = hasLog('ocr') || hasLog('invoice');
    const step2 = hasLog('benchmark') || hasLog('wfp') || hasLog('markup');
    const step3 = hasLog('otp') || hasLog('beneficiary') || hasLog('delivery');
    const step4 = hasLog('discrepancy') || hasLog('tolerance') || hasLog('reconcil');
    const step5 = hasLog('payout') || hasLog('escrow') || hasLog('frozen');

    const step2Alert = hasAlert('markup') || hasAlert('inflation') || hasAlert('exceed');
    const step3Alert = hasAlert('otp') || hasAlert('pending');
    const step4Alert = hasAlert('discrepancy') || hasAlert('halt') || hasAlert('diver');
    const step5Halted = hasAlert('halted') || hasAlert('lock') || hasAlert('frozen') || hasLog('suppressed');

    return {
      step1: step1 ? 'done' : isStreaming ? 'active' : 'idle',
      step2: step2Alert ? 'alert' : step2 ? 'done' : isStreaming && step1 ? 'active' : 'idle',
      step3: step3Alert ? 'alert' : step3 ? 'done' : isStreaming && step2 ? 'active' : 'idle',
      step4: step4Alert ? 'alert' : step4 ? 'done' : isStreaming && step3 ? 'active' : 'idle',
      step5: step5Halted ? 'frozen' : step5 ? 'done' : isStreaming && step4 ? 'active' : 'idle',
    };
  }, [logs, isStreaming]);

  const latestAlert = logs.filter(l => l.type === 'ALERT').slice(-1)[0];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200 mb-3.5 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <span className="text-xs font-mono font-bold text-slate-900 ml-1.5 flex items-center space-x-2">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            <span>Autonomous Cognitive Reasoning Stream</span>
          </span>

          {activeClaimId && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
              {activeClaimId}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isStreaming ? (
            <span className="inline-flex items-center space-x-2 text-[11px] text-sky-800 font-mono font-bold px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600" />
              </span>
              <span>COGNITIVE LOOP ACTIVE</span>
            </span>
          ) : latestAlert ? (
            <span className="inline-flex items-center space-x-1.5 text-[10px] text-rose-800 font-mono font-bold px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              <span>FRAUD DETECTED • CAPITAL FROZEN</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 text-[10px] text-slate-600 font-mono px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-medium">
              <Activity className="w-3 h-3 text-slate-500" />
              <span>AGENT IDLE • STANDBY</span>
            </span>
          )}
        </div>
      </div>

      {/* Visual 5-Stage Cognitive Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3.5">
        {/* Stage 1 */}
        <div className={`p-2.5 rounded-xl border text-center transition-all duration-300 ${
          pipelineState.step1 === 'done'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
            : pipelineState.step1 === 'active'
            ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-200 font-semibold animate-pulse'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <FileSearch className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">1. OCR Extract</span>
          </div>
          <span className="text-[10px] block opacity-80">Gemini 2.0 Vision</span>
        </div>

        {/* Stage 2 */}
        <div className={`p-2.5 rounded-xl border text-center transition-all duration-300 ${
          pipelineState.step2 === 'alert'
            ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200 font-bold'
            : pipelineState.step2 === 'done'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
            : pipelineState.step2 === 'active'
            ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-200 font-semibold animate-pulse'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <Scale className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">2. WFP Check</span>
          </div>
          <span className="text-[10px] block opacity-80">Market Baseline</span>
        </div>

        {/* Stage 3 */}
        <div className={`p-2.5 rounded-xl border text-center transition-all duration-300 ${
          pipelineState.step3 === 'alert'
            ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
            : pipelineState.step3 === 'done'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
            : pipelineState.step3 === 'active'
            ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-200 font-semibold animate-pulse'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">3. Field Proof</span>
          </div>
          <span className="text-[10px] block opacity-80">Twilio OTP & EXIF</span>
        </div>

        {/* Stage 4 */}
        <div className={`p-2.5 rounded-xl border text-center transition-all duration-300 ${
          pipelineState.step4 === 'alert'
            ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200 font-bold'
            : pipelineState.step4 === 'done'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
            : pipelineState.step4 === 'active'
            ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-200 font-semibold animate-pulse'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">4. Discrepancy Gate</span>
          </div>
          <span className="text-[10px] block opacity-80">&lt;15% Tolerance Rule</span>
        </div>

        {/* Stage 5 */}
        <div className={`p-2.5 rounded-xl border text-center transition-all duration-300 col-span-2 sm:col-span-1 ${
          pipelineState.step5 === 'frozen'
            ? 'bg-rose-100 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-200'
            : pipelineState.step5 === 'done'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
            : pipelineState.step5 === 'active'
            ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-200 font-semibold animate-pulse'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            {pipelineState.step5 === 'frozen' ? <Lock className="w-3.5 h-3.5 text-rose-700" /> : <Send className="w-3.5 h-3.5 text-emerald-700" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {pipelineState.step5 === 'frozen' ? '5. Payout Frozen' : '5. PayPal Payout'}
            </span>
          </div>
          <span className="text-[10px] block opacity-80">
            {pipelineState.step5 === 'frozen' ? 'Capital Locked' : 'Autonomous API'}
          </span>
        </div>
      </div>

      {/* Terminal Output Stream (Clean Monospace on White/Slate) */}
      <div
        ref={scrollRef}
        className="font-mono text-xs max-h-56 overflow-y-auto space-y-2 pr-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner"
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 italic py-6 text-center font-sans text-xs">
            💡 Click one of the <strong className="text-slate-900">"Judge Demos"</strong> buttons above or submit an invoice claim to watch the autonomous AI reasoning loop execute live.
          </div>
        ) : (
          logs.map((log, index) => {
            let badgeStyle = 'bg-slate-200 text-slate-800 border-slate-300';
            let icon = <ArrowRight className="w-3 h-3 text-sky-600 shrink-0" />;

            if (log.type === 'ALERT') {
              badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
              icon = <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />;
            } else if (log.type === 'DECIDE') {
              badgeStyle = 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
              icon = <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />;
            } else if (log.type === 'ACTION') {
              badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
              icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
            }

            return (
              <div key={index} className="flex items-start space-x-2 animate-fadeIn">
                <span className="text-[10px] text-slate-400 shrink-0 font-mono mt-0.5">
                  [{log.timestamp}]
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase border shrink-0 tracking-wider font-semibold ${badgeStyle}`}>
                  {log.type}
                </span>
                <p className="text-slate-900 break-words flex-1 text-[11px] leading-snug font-medium">
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
