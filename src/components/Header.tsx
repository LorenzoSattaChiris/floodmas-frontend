import { useState, useEffect, useRef } from 'react';
import { useHealth } from '../hooks/useFloodData';
import { useLayerStore } from '../stores/layerStore';
import { useAgentChatStore } from '../stores/agentChatStore';
import { Tip } from './Tip';
import { FeatureHint } from './FeatureHint';
import { startTutorial } from './Tutorial';
import { resetPanelLayout } from './DraggablePanel';

function FloodMASLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14.5" stroke="url(#logo-gradient)" strokeWidth="1.5" opacity="0.7" />
      <path
        d="M16 4L26 10V22L16 28L6 22V10L16 4Z"
        fill="url(#logo-fill)"
        stroke="url(#logo-gradient)"
        strokeWidth="0.75"
        opacity="0.85"
      />
      <path d="M10 14 Q13 10 16 14 Q19 18 22 14" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.95" />
      <path d="M10 19 Q13 15 16 19 Q19 23 22 19" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
      <circle cx="16" cy="16.5" r="1.5" fill="white" opacity="0.9" />
      <defs>
        <linearGradient id="logo-gradient" x1="4" y1="4" x2="28" y2="28">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="logo-fill" x1="6" y1="4" x2="26" y2="28">
          <stop stopColor="rgba(14,165,233,0.25)" />
          <stop offset="1" stopColor="rgba(99,102,241,0.15)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LiveClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  );
  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
      1000,
    );
    return () => clearInterval(id);
  }, []);
  return <span className="text-[10px] text-white/25 font-mono tabular-nums">{time}</span>;
}

export default function Header() {
  const { data: health } = useHealth();
  const toggleLeft = useLayerStore((s) => s.toggleLeftPanel);
  const toggleRight = useLayerStore((s) => s.toggleRightPanel);
  const leftOpen = useLayerStore((s) => s.leftPanelOpen);
  const rightOpen = useLayerStore((s) => s.rightPanelOpen);
  const toggleChat = useAgentChatStore((s) => s.togglePanel);
  const chatOpen = useAgentChatStore((s) => s.panelOpen);
  const chatStreaming = useAgentChatStore((s) => s.isStreaming);

  const eaStatus = health?.services.environmentAgency;
  const bskyStatus = health?.services.bluesky;

  return (
    <header className="header-bar shrink-0 z-50 pointer-events-auto">
      {/* Left: menu + brand */}
      <div className="flex items-center gap-2">
        <FeatureHint id="layers">
          <Tip text="Toggle map layers panel" side="bottom">
            <button
              onClick={toggleLeft}
              className={`header-icon-btn ${leftOpen ? 'header-icon-btn-active' : ''}`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </button>
          </Tip>
        </FeatureHint>

        <div className="flex items-center gap-2 select-none">
          <FloodMASLogo />
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-[13px] tracking-wide bg-gradient-to-r from-flood-accent via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              FloodMAS
            </span>
            <span className="text-[7px] uppercase tracking-[0.18em] text-white/30 font-semibold">
              Intelligence Platform
            </span>
          </div>
        </div>
      </div>

      {/* Right cluster: statuses + clock + feed toggle */}
      <div className="flex items-center gap-1.5">
        <FeatureHint id="tutorial">
          <Tip text="Replay the guided platform tour" side="bottom">
            <button onClick={startTutorial} className="header-icon-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </button>
          </Tip>
        </FeatureHint>

        <SettingsDropdown />

        <div className="header-status-group" data-tour="header-status">
          <StatusDot label="EA Data" ok={eaStatus === 'ok'} detail="Environment Agency flood warnings & river gauges" />
          <div className="w-px h-3 bg-white/[0.06]" />
          <StatusDot label="Bluesky" ok={bskyStatus === 'ok'} detail="Community flood posts from Bluesky social" />
          <div className="w-px h-3 bg-white/[0.06]" />
          <LiveClock />
        </div>

        <FeatureHint id="agents">
          <Tip text="AI multi-agent orchestration — chat, proactive monitoring & report generation" side="bottom">
            <button
              onClick={toggleChat}
              className={`header-icon-btn ${chatOpen ? 'header-icon-btn-active' : ''}`}
            >
              <span className="relative">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.591.659H9.061a2.25 2.25 0 0 1-1.591-.659L5 14.5m14 0h-1.25m-11.5 0H5m1.757-5.686a8.959 8.959 0 0 1 10.486 0" />
              </svg>
                {chatStreaming && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                )}
              </span>
            </button>
          </Tip>
        </FeatureHint>

        <FeatureHint id="feed">
          <Tip text="Toggle real-time flood news feed — EA warnings & social posts" side="bottom">
          <button
            onClick={toggleRight}
            className={`header-icon-btn ${rightOpen ? 'header-icon-btn-active' : ''}`}
          >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </Tip>
        </FeatureHint>
      </div>
    </header>
  );
}

function SettingsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Tip text="Settings" side="bottom">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`header-icon-btn ${open ? 'header-icon-btn-active' : ''}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </Tip>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 glass rounded-lg border border-white/10 shadow-xl shadow-black/30 py-1 z-50">
          <button
            onClick={() => {
              resetPanelLayout();
              window.location.reload();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[11px] text-flood-textMuted hover:bg-white/[0.05] hover:text-flood-text transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-50">
              <path d="M3 12a9 9 0 1 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 22v-6h6" />
            </svg>
            Reset Panel Positions
          </button>
        </div>
      )}
    </div>
  );
}

function StatusDot({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  const tipText = ok
    ? `${label}: Live${detail ? ` — ${detail}` : ''}`
    : `${label}: Offline${detail ? ` — ${detail} unavailable` : ''}`;
  return (
    <Tip text={tipText} side="bottom">
      <div className="flex items-center gap-1.5 group">
        <span className="relative flex h-1.5 w-1.5">
          {ok && <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ping" />}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400 status-pulse'}`} />
        </span>
        <span className={`text-[10px] font-medium hidden sm:inline ${ok ? 'text-white/40' : 'text-red-400/70'}`}>
          {label}
        </span>
      </div>
    </Tip>
  );
}
