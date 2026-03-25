// ─── FloodMAS — Agent Chat Store (Zustand) ──────────────────────────

import { create } from 'zustand';

const AGENT_TOGGLE_KEY = 'floodmas-agent-panel-open';

function loadAgentOpen(): boolean {
  try {
    const raw = localStorage.getItem(AGENT_TOGGLE_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch { /* ignore */ }
  return false;
}

function saveAgentOpen(open: boolean) {
  try { localStorage.setItem(AGENT_TOGGLE_KEY, JSON.stringify(open)); } catch { /* quota */ }
}

/** SSE event from the server */
export interface AgentEvent {
  type: string;
  agent: string;
  content: string;
  tool?: string;
  args?: Record<string, unknown>;
  timestamp?: string;
  tokens?: { prompt: number; completion: number };
  durationMs?: number;
}

/** Chat message (user or agent) */
export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  tokens?: { prompt: number; completion: number };
}

/** Agent status for activity panel */
export interface AgentStatus {
  name: string;
  state: 'idle' | 'active' | 'done';
  toolCalls: number;
  tokens?: { prompt: number; completion: number };
  startedAt?: string;
}

/** Proactive scan result */
export interface ProactiveScan {
  id: string;
  content: string;
  timestamp: string;
  events: AgentEvent[];
}

interface AgentChatState {
  panelOpen: boolean;
  messages: ChatMessage[];
  events: AgentEvent[];
  agentStatuses: Map<string, AgentStatus>;
  isStreaming: boolean;
  sessionId: string | null;
  // Proactive
  proactiveEnabled: boolean;
  proactiveScans: ProactiveScan[];
  proactiveRunning: boolean;
  // Report
  reportContent: string | null;
  reportGenerating: boolean;

  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  addMessage: (msg: ChatMessage) => void;
  addEvent: (ev: AgentEvent) => void;
  setStreaming: (streaming: boolean) => void;
  setSessionId: (id: string | null) => void;
  clearChat: () => void;
  // Proactive
  toggleProactive: () => void;
  setProactiveRunning: (running: boolean) => void;
  addProactiveScan: (scan: ProactiveScan) => void;
  // Report
  setReportContent: (content: string | null) => void;
  setReportGenerating: (generating: boolean) => void;
}

export const useAgentChatStore = create<AgentChatState>((set) => ({
  panelOpen: loadAgentOpen(),
  messages: [],
  events: [],
  agentStatuses: new Map(),
  isStreaming: false,
  sessionId: null,
  proactiveEnabled: false,
  proactiveScans: [],
  proactiveRunning: false,
  reportContent: null,
  reportGenerating: false,

  togglePanel: () => set((s) => { const next = !s.panelOpen; saveAgentOpen(next); return { panelOpen: next }; }),
  openPanel: () => { saveAgentOpen(true); set({ panelOpen: true }); },
  closePanel: () => { saveAgentOpen(false); set({ panelOpen: false }); },

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  addEvent: (ev) =>
    set((s) => {
      const events = [...s.events, ev];
      const agentStatuses = new Map(s.agentStatuses);

      if (ev.type === 'agent_start') {
        agentStatuses.set(ev.agent, { name: ev.agent, state: 'active', toolCalls: 0, startedAt: ev.timestamp });
      } else if (ev.type === 'tool_call') {
        const existing = agentStatuses.get(ev.agent);
        if (existing) agentStatuses.set(ev.agent, { ...existing, toolCalls: existing.toolCalls + 1 });
      } else if (ev.type === 'agent_end') {
        const existing = agentStatuses.get(ev.agent);
        if (existing) agentStatuses.set(ev.agent, { ...existing, state: 'done', tokens: ev.tokens });
      }

      return { events, agentStatuses };
    }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setSessionId: (id) => set({ sessionId: id }),

  clearChat: () =>
    set({
      messages: [],
      events: [],
      agentStatuses: new Map(),
      isStreaming: false,
      sessionId: null,
      reportContent: null,
      reportGenerating: false,
    }),

  toggleProactive: () => set((s) => ({ proactiveEnabled: !s.proactiveEnabled })),
  setProactiveRunning: (running) => set({ proactiveRunning: running }),
  addProactiveScan: (scan) => set((s) => ({ proactiveScans: [scan, ...s.proactiveScans].slice(0, 10) })),

  setReportContent: (content) => set({ reportContent: content }),
  setReportGenerating: (generating) => set({ reportGenerating: generating }),
}));
