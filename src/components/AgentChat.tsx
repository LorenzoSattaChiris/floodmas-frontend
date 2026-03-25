// ─── FloodMAS — AgentChat Panel ──────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAgentChatStore, type AgentEvent, type ChatMessage } from '../stores/agentChatStore';
import { useAgentChat } from '../hooks/useAgentChat';
import { Tip } from './Tip';
import IntelTab from './IntelTab';
import {
  startProactiveScan, proactiveEventStreamUrl,
  startReportGeneration, reportEventStreamUrl,
} from '../services/api';

// ── Constants ────────────────────────────────────────────────────────

const AGENT_COLORS: Record<string, string> = {
  Coordinator: '#0ea5e9',
  Forecasting: '#14b8a6',
  Monitoring: '#a855f6',
  'Risk Analysis': '#f97316',
  'Emergency Response': '#ef4444',
  System: '#64748b',
};

const SCENARIOS = [
  'Full flood risk briefing for York',
  'River levels and weather forecast for Carlisle',
  'Emergency: major flooding in Sheffield — what resources are needed?',
  'Sensor anomalies and risk assessment for London',
];

// ── Main Component ───────────────────────────────────────────────────

export default function AgentChat() {
  const {
    messages, events, agentStatuses, isStreaming, panelOpen,
    proactiveRunning, reportGenerating,
  } = useAgentChatStore();
  const { sendMessage } = useAgentChat();
  const [input, setInput] = useState('');
  const [tab, setTab] = useState<'chat' | 'proactive' | 'report' | 'intel'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput('');
    sendMessage(msg);
    setTab('chat');
  };

  if (!panelOpen) return null;

  return (
    <div className="agent-chat-panel pointer-events-auto" data-tour="agent-chat">
      {/* Header — drag handle */}
      <div className="agent-chat-header" data-drag-handle>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400/60'}`} />
          <span className="font-bold text-xs tracking-wide text-white/90">AGENT ORCHESTRATION</span>
        </div>
        <div className="flex items-center gap-2">
          <Tip text="Clear all conversation messages" side="bottom">
            <button
              onClick={useAgentChatStore.getState().clearChat}
              className="text-white/30 hover:text-white/60 transition-colors text-[9px] font-medium"
            >
              CLEAR
            </button>
          </Tip>
          <Tip text="Close agent orchestration panel" side="bottom">
            <button
              onClick={useAgentChatStore.getState().closePanel}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </Tip>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-white/5">
        <Tip text="Chat with AI flood agents using live sensor and weather data" side="bottom" wrapClass="flex-1">
          <button
            onClick={() => setTab('chat')}
            className={`w-full py-1.5 text-[9px] font-semibold uppercase tracking-wider transition-all
              ${tab === 'chat' ? 'text-sky-400 border-b border-sky-400/60 bg-sky-400/5' : 'text-white/30 hover:text-white/50'}`}
          >
            chat
          </button>
        </Tip>
        <Tip text="Automatic monitoring — scans for flood risks every 60 seconds, up to 5 cycles" side="bottom" wrapClass="flex-1">
          <button
            onClick={() => setTab('proactive')}
            data-tour="tab-proactive"
            className={`w-full py-1.5 text-[9px] font-semibold uppercase tracking-wider transition-all
              ${tab === 'proactive' ? 'text-sky-400 border-b border-sky-400/60 bg-sky-400/5' : 'text-white/30 hover:text-white/50'}`}
          >
            {proactiveRunning && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1" />}
            proactive
          </button>
        </Tip>
        <Tip text="Generate a professional printable flood risk assessment report" side="bottom" wrapClass="flex-1">
          <button
            onClick={() => setTab('report')}
            data-tour="tab-report"
            className={`w-full py-1.5 text-[9px] font-semibold uppercase tracking-wider transition-all
              ${tab === 'report' ? 'text-sky-400 border-b border-sky-400/60 bg-sky-400/5' : 'text-white/30 hover:text-white/50'}`}
          >
            {reportGenerating && <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse mr-1" />}
            report
          </button>
        </Tip>
        <Tip text="Platform intelligence — data sources, agents, tools & ML models" side="bottom" wrapClass="flex-1">
          <button
            onClick={() => setTab('intel')}
            data-tour="tab-intel"
            className={`w-full py-1.5 text-[9px] font-semibold uppercase tracking-wider transition-all
              ${tab === 'intel' ? 'text-sky-400 border-b border-sky-400/60 bg-sky-400/5' : 'text-white/30 hover:text-white/50'}`}
          >
            intel
          </button>
        </Tip>
      </div>

      {/* Live Agent Status Bar */}
      {agentStatuses.size > 0 && tab === 'chat' && <AgentStatusBar agentStatuses={agentStatuses} events={events} />}

      {/* Chat Tab */}
      {tab === 'chat' && (
        <>
          <div className="agent-chat-messages">
            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-col gap-2 p-3">
                <p className="text-[10px] text-white/30 text-center mb-2">Choose a scenario or type a query</p>
                {SCENARIOS.map((s, i) => (
                  <button key={i} onClick={() => { setInput(''); sendMessage(s); }} className="agent-scenario-btn">{s}</button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} onAction={(action, content) => handleAction(action, content, sendMessage)} />
            ))}

            {isStreaming && (
              <div data-tour="live-trace">
                <LiveTrace events={events} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {events.length > 0 && <ActivityLog events={events} eventsEndRef={eventsEndRef} />}

          <div className="agent-chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isStreaming ? 'Agents working…' : 'Ask about flood conditions…'}
              disabled={isStreaming}
              className="agent-chat-input"
            />
          <Tip text="Send message to agents (or press Enter)" side="top">
            <button onClick={handleSend} disabled={isStreaming || !input.trim()} className="agent-chat-send-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </Tip>
          </div>
        </>
      )}

      {tab === 'proactive' && <ProactiveTab />}
      {tab === 'report' && <ReportTab />}
      {tab === 'intel' && <IntelTab />}
    </div>
  );
}

// ── Action handler ───────────────────────────────────────────────────

function handleAction(action: string, content: string, sendMessage: (m: string) => void) {
  switch (action) {
    case 'reverify':
      sendMessage(`Re-verify and update this with latest data: ${content.slice(0, 200)}`);
      break;
    case 'email':
      window.open(`mailto:?subject=${encodeURIComponent('FloodMAS Alert')}&body=${encodeURIComponent(content)}`, '_blank');
      break;
    case 'social':
      sendMessage(`Draft a concise social media post summarising: ${content.slice(0, 200)}`);
      break;
    case 'analyse':
      sendMessage(`Run a deeper analysis with all available tools on: ${content.slice(0, 200)}`);
      break;
    case 'report':
      useAgentChatStore.getState().setReportContent(null);
      void generateReport(content);
      break;
    case 'escalate':
      sendMessage(`Assess severity and recommend emergency escalation with Gold/Silver/Bronze command structure and key contacts for: ${content.slice(0, 200)}`);
      break;
  }
}

// ── Agent Status Bar ─────────────────────────────────────────────────

const ML_TOOLS = new Set(['forecast_flood_levels', 'predict_flood_risk']);

function AgentStatusBar({ agentStatuses, events }: { agentStatuses: Map<string, { name: string; state: string; toolCalls: number; tokens?: { prompt: number; completion: number } }>; events: { type: string; tool?: string }[] }) {
  const usedMl = events.some((e) => e.type === 'tool_call' && e.tool && ML_TOOLS.has(e.tool));
  return (
    <div className="agent-status-bar">
      {usedMl && (
        <div className="agent-status-chip" style={{ borderColor: '#a855f7' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-[9px] text-purple-300">ML</span>
        </div>
      )}
      {Array.from(agentStatuses.values()).map((agent) => (
        <div key={agent.name} className="agent-status-chip" style={{ borderColor: AGENT_COLORS[agent.name] ?? '#64748b' }}>
          <span
            className={`w-1.5 h-1.5 rounded-full ${agent.state === 'active' ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: AGENT_COLORS[agent.name] ?? '#64748b' }}
          />
          <span className="text-[9px] text-white/60">{agent.name}</span>
          {agent.toolCalls > 0 && <span className="text-[8px] text-white/30">{agent.toolCalls}t</span>}
          {agent.tokens && (
            <span className="text-[7px] text-white/20 font-mono">{agent.tokens.prompt + agent.tokens.completion}tok</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Message Bubble with Markdown + Action Cards ──────────────────────

function MessageBubble({ msg, onAction }: { msg: ChatMessage; onAction: (action: string, content: string) => void }) {
  const isAgent = msg.role === 'agent';
  return (
    <div className={`agent-chat-msg ${isAgent ? 'agent-chat-msg-agent' : 'agent-chat-msg-user'}`}>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] text-white/30">{msg.role === 'user' ? 'You' : 'FloodMAS'}</span>
        <div className="flex items-center gap-1.5">
          {msg.tokens && (
            <span className="text-[7px] text-white/15 font-mono">{msg.tokens.prompt + msg.tokens.completion} tokens</span>
          )}
          <span className="text-[7px] text-white/15 font-mono">
            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      </div>

      {isAgent ? (
        <div className="agent-md-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-[11px] text-white/80 leading-relaxed">{msg.content}</div>
      )}

      {/* Action cards */}
      {isAgent && msg.content.length > 50 && (
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/5">
          <ActionBtn icon="↻" label="Re-verify" tip="Re-query all agents with latest live sensor data" onClick={() => onAction('reverify', msg.content)} />
          <ActionBtn icon="✉" label="Email" tip="Open email composer pre-filled with this analysis" onClick={() => onAction('email', msg.content)} />
          <ActionBtn icon="📢" label="Social" tip="Draft a social media alert from this analysis" onClick={() => onAction('social', msg.content)} />
          <ActionBtn icon="🔬" label="Analyse" tip="Run a deeper multi-agent analysis with all available tools" onClick={() => onAction('analyse', msg.content)} />
          <ActionBtn icon="📄" label="Report" tip="Generate a full professional PDF report from this analysis" onClick={() => onAction('report', msg.content)} />
          <ActionBtn icon="🚨" label="Escalate" tip="Escalate through Gold/Silver/Bronze emergency command structure" onClick={() => onAction('escalate', msg.content)} />
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, label, onClick, tip }: { icon: string; label: string; onClick: () => void; tip: string }) {
  return (
    <Tip text={tip} side="top">
      <button
        onClick={onClick}
        className="agent-action-btn"
      >
        <span>{icon}</span>
        {label}
      </button>
    </Tip>
  );
}

// ── Live Trace (replaces static "Agents working…") ──────────────────

const TRACE_ICONS: Record<string, string> = {
  stream_start: '▶',
  query_start: '📋',
  agent_start: '⏳',
  agent_end: '✅',
  tool_call: '🔧',
  tool_result: '📥',
  llm_call: '🧠',
  agent_response: '💬',
  system: '⚙️',
  error: '❌',
};

function traceLabel(ev: AgentEvent): string {
  switch (ev.type) {
    case 'stream_start': return 'Starting orchestration…';
    case 'query_start': return `Query received`;
    case 'agent_start': return `${ev.agent} activated`;
    case 'agent_end': return `${ev.agent} finished`;
    case 'tool_call': return `${ev.agent} → ${ev.tool ?? 'tool'}`;
    case 'tool_result': return `${ev.tool ?? 'tool'} returned data`;
    case 'llm_call': return ev.content || `${ev.agent} LLM call`;
    case 'agent_response': return `${ev.agent} composing response`;
    case 'system': return ev.content?.slice(0, 80) || 'System';
    case 'error': return ev.content?.slice(0, 80) || 'Error';
    default: return ev.content?.slice(0, 60) || ev.type;
  }
}

function LiveTrace({ events }: { events: AgentEvent[] }) {
  const traceEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    traceEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  // Count LLM calls for the progress indicator
  const llmCalls = events.filter((e) => e.type === 'llm_call').length;
  const llmLimit = (() => {
    const limitEvent = events.find((e) => e.type === 'llm_call' && e.content.includes('/'));
    if (limitEvent) {
      const match = limitEvent.content.match(/(\d+)\/(\d+)/);
      return match ? parseInt(match[2], 10) : 0;
    }
    return 0;
  })();

  return (
    <div className="px-2 py-1.5">
      {/* Header with spinner and LLM call counter */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <div className="agent-typing-indicator"><span /><span /><span /></div>
          <span className="text-[9px] text-white/40 font-semibold tracking-wide">LIVE TRACE</span>
        </div>
        {llmLimit > 0 && (
          <span className="text-[8px] text-white/25 font-mono">
            LLM {llmCalls}/{llmLimit}
          </span>
        )}
      </div>

      {/* Scrollable trace log */}
      <div className="max-h-[140px] overflow-y-auto scrollbar-thin space-y-[2px] rounded-md bg-white/[0.02] border border-white/5 px-2 py-1">
        {events.map((ev, i) => (
          <div key={i} className="flex items-center gap-1.5 py-[1px]">
            <span
              className="w-1 h-1 rounded-full shrink-0"
              style={{ backgroundColor: AGENT_COLORS[ev.agent] ?? '#64748b' }}
            />
            <span className="text-[7px] text-white/15 shrink-0 font-mono w-[42px]">
              {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
            </span>
            <span className="text-[8px] shrink-0">{TRACE_ICONS[ev.type] ?? '·'}</span>
            <span className="text-[8px] text-white/30 truncate flex-1">{traceLabel(ev)}</span>
          </div>
        ))}
        <div ref={traceEndRef} />
      </div>
    </div>
  );
}

// ── Enhanced Activity Log ────────────────────────────────────────────

function ActivityLog({ events, eventsEndRef }: { events: AgentEvent[]; eventsEndRef: React.RefObject<HTMLDivElement | null> }) {
  const [expanded, setExpanded] = useState(false);
  const totalTokens = events
    .filter((e) => e.tokens)
    .reduce((sum, e) => sum + (e.tokens?.prompt ?? 0) + (e.tokens?.completion ?? 0), 0);

  return (
    <div className="agent-activity-log">
      <Tip text="View timestamp and token trace of agent execution" side="top" wrap="block">
        <button onClick={() => setExpanded(!expanded)} className="agent-activity-toggle">
        <span className="text-[9px] text-white/40 font-medium">
          ACTIVITY LOG ({events.length}){totalTokens > 0 && ` · ${totalTokens} tok`}
        </span>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-white/30 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        </button>
      </Tip>
      {expanded && (
        <div className="agent-activity-list">
          {events.map((ev, i) => (
            <div key={i} className="agent-activity-item">
              <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: AGENT_COLORS[ev.agent] ?? '#64748b' }} />
              <span className="text-[7px] text-white/20 shrink-0 font-mono w-[50px]">
                {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
              </span>
              <span className="text-[8px] text-white/30 shrink-0 font-mono w-12 truncate">{ev.agent}</span>
              <span className="text-[8px] text-white/20 truncate flex-1">
                {ev.type === 'tool_call' ? `→ ${ev.tool}` :
                 ev.type === 'tool_result' ? `← ${ev.tool}` :
                 ev.type === 'llm_call' ? `🧠 ${ev.content}` :
                 ev.type === 'agent_end' && ev.tokens ? `✓ done (${ev.tokens.prompt + ev.tokens.completion} tok)` :
                 ev.content?.slice(0, 60)}
              </span>
            </div>
          ))}
          <div ref={eventsEndRef} />
        </div>
      )}
    </div>
  );
}

// ── Proactive Monitoring Tab ─────────────────────────────────────────

function ProactiveTab() {
  const { proactiveEnabled, proactiveScans, proactiveRunning } = useAgentChatStore();
  const toggleProactive = useAgentChatStore((s) => s.toggleProactive);
  const setProactiveRunning = useAgentChatStore((s) => s.setProactiveRunning);
  const addProactiveScan = useAgentChatStore((s) => s.addProactiveScan);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);

  const runScan = useCallback(async () => {
    setProactiveRunning(true);
    try {
      const { sessionId } = await startProactiveScan();
      const scanEvents: AgentEvent[] = [];
      let finalContent = '';

      await new Promise<void>((resolve) => {
        const es = new EventSource(proactiveEventStreamUrl(sessionId));
        es.onmessage = (e) => {
          if (e.data === '[DONE]') { es.close(); resolve(); return; }
          try {
            const ev = JSON.parse(e.data) as AgentEvent;
            scanEvents.push(ev);
            if (ev.type === 'final_response') finalContent = ev.content;
          } catch { /* ignore */ }
        };
        es.onerror = () => { es.close(); resolve(); };
      });

      addProactiveScan({
        id: crypto.randomUUID(),
        content: finalContent || 'Scan completed — no findings.',
        timestamp: new Date().toISOString(),
        events: scanEvents,
      });
    } catch {
      addProactiveScan({
        id: crypto.randomUUID(),
        content: 'Proactive scan failed — check server connection.',
        timestamp: new Date().toISOString(),
        events: [],
      });
    } finally {
      setProactiveRunning(false);
    }
  }, [setProactiveRunning, addProactiveScan]);

  useEffect(() => {
    if (proactiveEnabled) {
      countRef.current = 0;
      void runScan();
      countRef.current = 1;
      intervalRef.current = setInterval(() => {
        if (countRef.current >= 5) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          useAgentChatStore.getState().toggleProactive();
          return;
        }
        countRef.current++;
        void runScan();
      }, 60_000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [proactiveEnabled, runScan]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div>
          <div className="text-[10px] text-white/60 font-semibold">Proactive Monitoring</div>
          <div className="text-[8px] text-white/25">Auto-scans every 60s for up to 5 min</div>
        </div>
        <Tip text={proactiveEnabled ? 'Stop automatic flood monitoring' : 'Start automatic flood monitoring (every 60 s, up to 5 scans)'} side="left">
          <button
            onClick={toggleProactive}
            className={`relative w-9 h-5 rounded-full transition-colors ${proactiveEnabled ? 'bg-sky-500/40' : 'bg-white/10'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${proactiveEnabled ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        </Tip>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
        {proactiveRunning && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
            <div className="agent-typing-indicator"><span /><span /><span /></div>
            <span className="text-[9px] text-amber-400/60">Scanning…</span>
          </div>
        )}
        {proactiveScans.length === 0 && !proactiveRunning && (
          <div className="text-[9px] text-white/20 text-center py-8">
            Enable monitoring to start automatic scans
          </div>
        )}
        {proactiveScans.map((scan) => (
          <div key={scan.id} className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] text-white/25 font-mono">
                {new Date(scan.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[7px] text-white/15">{scan.events.length} events</span>
            </div>
            <div className="agent-md-content text-[10px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{scan.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Report Generation ────────────────────────────────────────────────

async function generateReport(conversationContext: string) {
  const store = useAgentChatStore.getState();
  store.setReportGenerating(true);
  store.setReportContent(null);

  try {
    const { sessionId } = await startReportGeneration(conversationContext);
    const es = new EventSource(reportEventStreamUrl(sessionId));

    es.onmessage = (e) => {
      if (e.data === '[DONE]') { es.close(); useAgentChatStore.getState().setReportGenerating(false); return; }
      try {
        const ev = JSON.parse(e.data) as AgentEvent;
        if (ev.type === 'final_response') {
          useAgentChatStore.getState().setReportContent(ev.content);
        }
      } catch { /* ignore */ }
    };
    es.onerror = () => { es.close(); useAgentChatStore.getState().setReportGenerating(false); };
  } catch {
    useAgentChatStore.getState().setReportGenerating(false);
    useAgentChatStore.getState().setReportContent('Failed to generate report — check server connection.');
  }
}

function ReportTab() {
  const { messages, reportContent, reportGenerating } = useAgentChatStore();
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    const summary = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'FloodMAS'}: ${m.content}`)
      .join('\n\n');
    void generateReport(summary || 'Generate a comprehensive flood risk assessment for all UK high-risk areas.');
  };

  const handlePrint = () => {
    if (!reportRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>FloodMAS Report</title>
      <style>
        body{font-family:'Segoe UI',system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}
        h1{color:#0369a1;border-bottom:2px solid #0ea5e9;padding-bottom:8px}
        h2{color:#075985;margin-top:24px}h3{color:#0c4a6e}
        table{width:100%;border-collapse:collapse;margin:12px 0}
        th,td{border:1px solid #e2e8f0;padding:6px 10px;text-align:left;font-size:13px}
        th{background:#f0f9ff;font-weight:600}
        code{background:#f1f5f9;padding:2px 4px;border-radius:3px;font-size:0.9em}
        blockquote{border-left:3px solid #0ea5e9;margin-left:0;padding-left:12px;color:#475569}
        ul,ol{padding-left:20px}li{margin:4px 0}
        hr{border:none;border-top:1px solid #e2e8f0;margin:24px 0}
        .footer{margin-top:40px;padding-top:16px;border-top:2px solid #e2e8f0;font-size:11px;color:#94a3b8}
        @media print{body{margin:20px}}
      </style></head><body>`);
    printWindow.document.write(reportRef.current.innerHTML);
    printWindow.document.write(`<div class="footer">Generated by FloodMAS Multi-Agent System · ${new Date().toLocaleDateString('en-GB')}</div>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="text-[10px] text-white/60 font-semibold">Report Generator</div>
        <div className="flex items-center gap-2">
          {reportContent && (
            <Tip text="Open a print-ready version of this report in a new window" side="bottom">
              <button onClick={handlePrint} className="text-[8px] text-sky-400/60 hover:text-sky-400 transition-colors font-semibold">
                PRINT / PDF
              </button>
            </Tip>
          )}
          <Tip text={reportGenerating ? 'Generating report…' : messages.length > 0 ? 'Generate a professional report from this conversation' : 'Generate a standalone flood risk assessment report'} side="bottom">
            <button
              onClick={handleGenerate}
              disabled={reportGenerating}
              className="text-[8px] text-sky-400/60 hover:text-sky-400 disabled:text-white/20 transition-colors font-semibold"
            >
              {reportGenerating ? 'GENERATING…' : 'GENERATE'}
            </button>
          </Tip>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {reportGenerating && !reportContent && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="agent-typing-indicator"><span /><span /><span /></div>
            <span className="text-[9px] text-white/30">Agents gathering data and generating report…</span>
          </div>
        )}

        {!reportContent && !reportGenerating && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/10">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span className="text-[9px] text-white/20 text-center">
              {messages.length > 0
                ? 'Click GENERATE to create a report from this conversation'
                : 'Start a chat first, then generate a report from findings'}
            </span>
          </div>
        )}

        {reportContent && (
          <div ref={reportRef} className="agent-md-content agent-report-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
