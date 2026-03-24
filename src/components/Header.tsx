import { useState, useEffect } from 'react';
import { useHealth } from '../hooks/useFloodData';
import { useLayerStore } from '../stores/layerStore';

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

  const eaStatus = health?.services.environmentAgency;
  const bskyStatus = health?.services.bluesky;

  return (
    <header className="header-bar shrink-0 z-50 pointer-events-auto">
      {/* Left: menu + brand */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLeft}
          className={`header-icon-btn ${leftOpen ? 'header-icon-btn-active' : ''}`}
          title="Toggle layers panel"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        </button>

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
        <div className="header-status-group">
          <StatusDot label="EA Data" ok={eaStatus === 'ok'} />
          <div className="w-px h-3 bg-white/[0.06]" />
          <StatusDot label="Bluesky" ok={bskyStatus === 'ok'} />
          <div className="w-px h-3 bg-white/[0.06]" />
          <LiveClock />
        </div>

        <button
          onClick={toggleRight}
          className={`header-icon-btn ${rightOpen ? 'header-icon-btn-active' : ''}`}
          title="Toggle social feed"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function StatusDot({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5 group" title={`${label}: ${ok ? 'Connected' : 'Offline'}`}>
      <span className="relative flex h-1.5 w-1.5">
        {ok && <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ping" />}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400 status-pulse'}`} />
      </span>
      <span className={`text-[10px] font-medium hidden sm:inline ${ok ? 'text-white/40' : 'text-red-400/70'}`}>
        {label}
      </span>
    </div>
  );
}
