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
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl mb-6 overflow-hidden border border-white/10 relative">
      {/* Background ambient glow */}
      <div className={`absolute -right-10 -top-10 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        latestAlert ? 'bg-red-500/10' : isStreaming ? 'bg-sky-500/10' : 'bg-purple-500/5'
      }`} />

      {/* Terminal Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/10 mb-3.5 gap-2 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-sm shadow-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-sm shadow-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-sm shadow-emerald-500/40" />
          </div>

          <span className="text-xs font-mono font-bold text-slate-100 ml-1.5 flex items-center space-x-2">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Autonomous Cognitive Reasoning Stream</span>
          </span>

          {activeClaimId && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-300 border border-sky-800/80 shadow-sm">
              {activeClaimId}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isStreaming ? (
            <span className="inline-flex items-center space-x-2 text-[11px] text-sky-400 font-mono font-bold px-2.5 py-1 rounded-full bg-sky-950/80 border border-sky-800 shadow-sm shadow-sky-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
              </span>
              <span>COGNITIVE LOOP ACTIVE</span>
            </span>
          ) : latestAlert ? (
            <span className="inline-flex items-center space-x-1.5 text-[10px] text-red-300 font-mono font-bold px-2.5 py-1 rounded-full bg-red-950/80 border border-red-800 shadow-sm">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              <span>FRAUD DETECTED • CAPITAL FROZEN</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-white/5">
              <Activity className="w-3 h-3 text-slate-500" />
              <span>AGENT IDLE • STANDBY</span>
            </span>
          )}
        </div>
      </div>

      {/* Visual 5-Stage Cognitive Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3.5 relative z-10">
        {/* Stage 1 */}
        <div className={`p-2 rounded-xl border text-center transition-all duration-300 ${
          pipelineState.step1 === 'done'
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : pipelineState.step1 === 'active'
            ? 'bg-sky-950/50 border-sky-500 text-sky-300 ring-1 ring-sky-500/50 animate-pulse'
            : 'bg-slate-900/60 border-white/5 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <FileSearch className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">1. OCR Extract</span>
          </div>
          <span className="text-[9px] block opacity-80">Gemini 2.0 Vision</span>
        </div>

        {/* Stage 2 */}
        <div className={`p-2 rounded-xl border text-center transition-all duration-300 ${
          pipelineState.step2 === 'alert'
            ? 'bg-red-950/50 border-red-700 text-red-300 ring-1 ring-red-500/50'
            : pipelineState.step2 === 'done'
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : pipelineState.step2 === 'active'
            ? 'bg-sky-950/50 border-sky-500 text-sky-300 ring-1 ring-sky-500/50 animate-pulse'
            : 'bg-slate-900/60 border-white/5 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <Scale className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">2. WFP Check</span>
          </div>
          <span className="text-[9px] block opacity-80">Market Baseline</span>
        </div>

        {/* Stage 3 */}
        <div className={`p-2 rounded-xl border text-center transition-all duration-300 ${
          pipelineState.step3 === 'alert'
            ? 'bg-amber-950/50 border-amber-700 text-amber-300'
            : pipelineState.step3 === 'done'
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : pipelineState.step3 === 'active'
            ? 'bg-sky-950/50 border-sky-500 text-sky-300 ring-1 ring-sky-500/50 animate-pulse'
            : 'bg-slate-900/60 border-white/5 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <Smartphone className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">3. Field Proof</span>
          </div>
          <span className="text-[9px] block opacity-80">Twilio OTP & EXIF</span>
        </div>

        {/* Stage 4 */}
        <div className={`p-2 rounded-xl border text-center transition-all duration-300 ${
          pipelineState.step4 === 'alert'
            ? 'bg-red-950/50 border-red-700 text-red-300 ring-1 ring-red-500/50'
            : pipelineState.step4 === 'done'
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : pipelineState.step4 === 'active'
            ? 'bg-sky-950/50 border-sky-500 text-sky-300 ring-1 ring-sky-500/50 animate-pulse'
            : 'bg-slate-900/60 border-white/5 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <Cpu className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">4. Discrepancy Gate</span>
          </div>
          <span className="text-[9px] block opacity-80">&lt;15% Tolerance Rule</span>
        </div>

        {/* Stage 5 */}
        <div className={`p-2 rounded-xl border text-center transition-all duration-300 col-span-2 sm:col-span-1 ${
          pipelineState.step5 === 'frozen'
            ? 'bg-red-950/60 border-red-600 text-red-200 ring-1 ring-red-500'
            : pipelineState.step5 === 'done'
            ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200'
            : pipelineState.step5 === 'active'
            ? 'bg-sky-950/50 border-sky-500 text-sky-300 ring-1 ring-sky-500/50 animate-pulse'
            : 'bg-slate-900/60 border-white/5 text-slate-500'
        }`}>
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            {pipelineState.step5 === 'frozen' ? <Lock className="w-3 h-3 text-red-400" /> : <Send className="w-3 h-3" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {pipelineState.step5 === 'frozen' ? '5. Payout Frozen' : '5. PayPal Payout'}
            </span>
          </div>
          <span className="text-[9px] block opacity-80">
            {pipelineState.step5 === 'frozen' ? 'Capital Locked' : 'Autonomous API'}
          </span>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div
        ref={scrollRef}
        className="font-mono text-xs max-h-56 overflow-y-auto space-y-2 pr-2 leading-relaxed bg-black/50 p-3.5 rounded-xl border border-white/5 shadow-inner"
      >
        {logs.length === 0 ? (
          <div className="text-slate-400 italic py-6 text-center font-sans text-xs">
            💡 Click one of the <strong className="text-sky-300">"Judge Demos"</strong> buttons above or submit an invoice claim to watch the autonomous AI reasoning loop execute live.
          </div>
        ) : (
          logs.map((log, index) => {
            let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
            let icon = <ArrowRight className="w-3 h-3 text-sky-400 shrink-0" />;

            if (log.type === 'ALERT') {
              badgeStyle = 'bg-red-950 text-red-300 border-red-700 font-bold shadow-sm shadow-red-950';
              icon = <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />;
            } else if (log.type === 'DECIDE') {
              badgeStyle = 'bg-purple-950 text-purple-300 border-purple-700 font-bold';
              icon = <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" />;
            } else if (log.type === 'ACTION') {
              badgeStyle = 'bg-emerald-950 text-emerald-300 border-emerald-700 font-bold';
              icon = <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />;
            }

            return (
              <div key={index} className="flex items-start space-x-2 animate-fadeIn">
                <span className="text-[10px] text-slate-500 shrink-0 font-mono mt-0.5">
                  [{log.timestamp}]
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase border shrink-0 tracking-wider font-semibold ${badgeStyle}`}>
                  {log.type}
                </span>
                <p className="text-slate-200 break-words flex-1 text-[11px] leading-snug">
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
