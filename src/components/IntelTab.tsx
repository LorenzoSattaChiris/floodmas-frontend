// ─── FloodMAS — Intel Tab ────────────────────────────────────────────

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { DATA_SOURCES, AGENTS, TOOLS, ML_MODELS, type DataSource } from '../config/intel';
import { useHealth } from '../hooks/useFloodData';

const AgentGraph = lazy(() => import('./AgentGraph'));

type ExpandedSection = 'data-sources' | 'agent-arch' | 'tool-inventory' | 'ml-models' | null;

// ── Type Badges ──────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
  api:     'bg-sky-500/15 text-sky-300',
  dataset: 'bg-amber-500/15 text-amber-300',
  tiles:   'bg-emerald-500/15 text-emerald-300',
};

const AUTH_STYLES: Record<string, string> = {
  none:      'bg-white/5 text-white/30',
  'api-key': 'bg-violet-500/15 text-violet-300',
};

function Badge({ text, style }: { text: string; style: string }) {
  return <span className={`text-[7px] font-semibold px-1.5 py-0.5 rounded-full ${style}`}>{text}</span>;
}

// ── Status Dot ───────────────────────────────────────────────────────

function StatusDot({ ds, healthServices }: { ds: DataSource; healthServices?: Record<string, string> }) {
  if (ds.status === 'static') {
    return <span className="w-1.5 h-1.5 rounded-full bg-white/15" title="Static dataset" />;
  }
  // If we have a health key, show real-time status
  if (ds.healthKey && healthServices) {
    const ok = healthServices[ds.healthKey] === 'ok';
    return (
      <span className="relative flex h-1.5 w-1.5" title={ok ? 'Online' : 'Offline'}>
        {ok && <span className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping" />}
        <span className={`relative w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
      </span>
    );
  }
  // Live but no health check — assume ok
  return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" title="Live" />;
}

// ── Section Header ───────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, onExpand }: { icon: string; title: string; subtitle: string; onExpand?: () => void }) {
  return (
    <div className="px-3 pt-3 pb-1.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-xs">{icon}</span>
        <span className="text-[10px] font-bold text-white/80 tracking-wide">{title}</span>
        {onExpand && (
          <button
            onClick={onExpand}
            className="ml-auto p-1 rounded hover:bg-white/[0.06] transition-colors group"
            title="Expand full screen"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/25 group-hover:text-white/60 transition-colors">
              <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-[8px] text-white/25">{subtitle}</p>
    </div>
  );
}

// ── Collapsible Tool Group ───────────────────────────────────────────

function ToolGroup({ specialist, tools }: { specialist: string; tools: typeof TOOLS }) {
  const [open, setOpen] = useState(false);
  const agent = AGENTS.find((a) => a.name === specialist);
  const color = agent?.color ?? '#64748b';

  return (
    <div className="border-b border-white/[0.04] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[9px] font-semibold text-white/60">{specialist}</span>
          <span className="text-[7px] text-white/20">{tools.length} tools</span>
        </div>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-white/20 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-3 pb-2 space-y-1">
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-start gap-2 py-0.5">
              <span className="w-1 h-1 rounded-full bg-white/10 mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-medium text-white/50">{tool.name}</span>
                  {tool.mlModel && (
                    <span className="text-[6px] font-bold px-1 py-px rounded bg-purple-500/20 text-purple-300">ML</span>
                  )}
                </div>
                <p className="text-[7px] text-white/20 leading-relaxed">{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ML Model Card ────────────────────────────────────────────────────

function ModelCard({ model }: { model: typeof ML_MODELS[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{model.badge}</span>
            <span className="text-[9px] font-semibold text-white/70">{model.name}</span>
          </div>
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-white/20 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <p className="text-[7px] text-white/30 leading-relaxed">{model.description}</p>
      </button>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5">
          <div>
            <span className="text-[7px] text-white/20 font-semibold">Architecture</span>
            <p className="text-[7px] text-white/35 font-mono leading-relaxed mt-0.5">{model.architecture}</p>
          </div>
          <div>
            <span className="text-[7px] text-white/20 font-semibold">Inputs ({model.inputFeatures.length})</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {model.inputFeatures.map((f) => (
                <span key={f} className="text-[6px] px-1.5 py-0.5 rounded bg-white/5 text-white/25">{f}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[7px] text-white/20 font-semibold">Outputs</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {model.outputs.map((o) => (
                <span key={o} className="text-[6px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300/60">{o}</span>
              ))}
            </div>
          </div>
          <div className="text-[7px] text-white/20">
            <span className="font-semibold">Loss:</span> <span className="font-mono text-white/30">{model.loss}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

// Group tools by specialist
const TOOL_GROUPS = AGENTS.filter((a) => a.role === 'worker').map((agent) => ({
  specialist: agent.name,
  tools: TOOLS.filter((t) => agent.toolIds.includes(t.id)),
}));

// ── Fullscreen Modal ─────────────────────────────────────────────────

function FullscreenModal({ section, onClose, healthServices }: {
  section: ExpandedSection;
  onClose: () => void;
  healthServices?: Record<string, string>;
}) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const onAnimEnd = useCallback(() => {
    if (closing) onClose();
  }, [closing, onClose]);

  if (!section) return null;

  const sectionMeta: Record<string, { icon: string; title: string; subtitle: string }> = {
    'data-sources':    { icon: '📡', title: 'DATA SOURCES',        subtitle: `${DATA_SOURCES.filter(d => d.status === 'live').length} live APIs + ${DATA_SOURCES.filter(d => d.status === 'static').length} local datasets` },
    'agent-arch':      { icon: '🧠', title: 'AGENT ARCHITECTURE',  subtitle: `${AGENTS.length} agents · ${TOOLS.length} tools · ${ML_MODELS.length} ML models` },
    'tool-inventory':  { icon: '🔧', title: 'TOOL INVENTORY',      subtitle: `${TOOLS.length} specialist tools across ${TOOL_GROUPS.length} departments` },
    'ml-models':       { icon: '⚡', title: 'ML MODELS',            subtitle: 'Physics-informed neural networks and ensemble risk scoring' },
  };

  const meta = sectionMeta[section];

  return createPortal(
    <div
      className={`intel-modal-overlay ${closing ? 'intel-modal-out' : 'intel-modal-in'}`}
      onAnimationEnd={onAnimEnd}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={`intel-modal-content ${closing ? 'intel-content-out' : 'intel-content-in'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{meta.icon}</span>
            <div>
              <h2 className="text-sm font-bold text-white/90 tracking-wide">{meta.title}</h2>
              <p className="text-[10px] text-white/30 mt-0.5">{meta.subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors group"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-white/70 transition-colors">
              <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {section === 'data-sources' && <ExpandedDataSources healthServices={healthServices} />}
          {section === 'agent-arch' && <ExpandedAgentArch />}
          {section === 'tool-inventory' && <ExpandedToolInventory />}
          {section === 'ml-models' && <ExpandedMLModels />}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Expanded: Data Sources ───────────────────────────────────────────

function ExpandedDataSources({ healthServices }: { healthServices?: Record<string, string> }) {
  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="grid grid-cols-[32px_1.5fr_60px_50px_2fr_55px_24px] gap-2 px-4 py-2.5 bg-white/[0.03] text-[9px] font-semibold text-white/35 uppercase tracking-wider">
        <span>#</span><span>Source</span><span>Type</span><span>Auth</span><span>Data</span><span>Refresh</span><span></span>
      </div>
      {DATA_SOURCES.map((ds) => (
        <div key={ds.id} className="grid grid-cols-[32px_1.5fr_60px_50px_2fr_55px_24px] gap-2 items-center px-4 py-2 border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors">
          <span className="text-[9px] text-white/20 font-mono">{ds.id}</span>
          <div>
            <span className="text-[11px] text-white/70 font-medium">{ds.name}</span>
            <span className="text-[8px] text-white/20 ml-1.5">{ds.provider}</span>
          </div>
          <Badge text={ds.type.toUpperCase()} style={TYPE_STYLES[ds.type]} />
          <Badge text={ds.auth === 'none' ? '—' : 'KEY'} style={AUTH_STYLES[ds.auth]} />
          <span className="text-[9px] text-white/35 leading-relaxed">{ds.data}</span>
          <span className="text-[9px] text-white/25 font-mono">{ds.refresh}</span>
          <StatusDot ds={ds} healthServices={healthServices} />
        </div>
      ))}
    </div>
  );
}

// ── Expanded: Agent Architecture ─────────────────────────────────────

function ExpandedAgentArch() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <Suspense fallback={
        <div className="flex-1 min-h-[500px] rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
          <span className="text-xs text-white/20">Loading graph…</span>
        </div>
      }>
        <AgentGraph fullscreen />
      </Suspense>
    </div>
  );
}

// ── Expanded: Tool Inventory ─────────────────────────────────────────

function ExpandedToolGroup({ specialist, tools }: { specialist: string; tools: typeof TOOLS }) {
  const [open, setOpen] = useState(true);
  const agent = AGENTS.find((a) => a.name === specialist);
  const color = agent?.color ?? '#64748b';

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-semibold text-white/70">{specialist}</span>
          <span className="text-[9px] text-white/25 ml-1">{tools.length} tools</span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-white/25 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {tools.map((tool) => (
            <div key={tool.id} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] font-semibold text-white/60">{tool.name}</span>
                {tool.mlModel && (
                  <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">ML</span>
                )}
              </div>
              <p className="text-[8px] text-white/30 leading-relaxed">{tool.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpandedToolInventory() {
  return (
    <div className="space-y-3">
      {TOOL_GROUPS.map((group) => (
        <ExpandedToolGroup key={group.specialist} specialist={group.specialist} tools={group.tools} />
      ))}
    </div>
  );
}

// ── Expanded: ML Models ──────────────────────────────────────────────

function ExpandedModelCard({ model }: { model: typeof ML_MODELS[0] }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">{model.badge}</span>
        <span className="text-sm font-semibold text-white/80">{model.name}</span>
      </div>
      <p className="text-[10px] text-white/40 leading-relaxed mb-4">{model.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
          <span className="text-[9px] text-white/25 font-semibold">Architecture</span>
          <p className="text-[10px] text-white/45 font-mono leading-relaxed mt-1">{model.architecture}</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
          <span className="text-[9px] text-white/25 font-semibold">Loss Function</span>
          <p className="text-[10px] text-white/45 font-mono leading-relaxed mt-1">{model.loss}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="text-[9px] text-white/25 font-semibold">Input Features ({model.inputFeatures.length})</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {model.inputFeatures.map((f) => (
              <span key={f} className="text-[8px] px-2 py-1 rounded bg-white/5 text-white/30">{f}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[9px] text-white/25 font-semibold">Outputs</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {model.outputs.map((o) => (
              <span key={o} className="text-[8px] px-2 py-1 rounded bg-purple-500/10 text-purple-300/70">{o}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpandedMLModels() {
  return (
    <div className="space-y-4">
      {ML_MODELS.map((model) => (
        <ExpandedModelCard key={model.id} model={model} />
      ))}
    </div>
  );
}

export default function IntelTab() {
  const { data: health } = useHealth();
  const healthServices = health?.services as Record<string, string> | undefined;
  const [expanded, setExpanded] = useState<ExpandedSection>(null);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin">

      {/* ── Data Sources ── */}
      <SectionHeader
        icon="📡"
        title="DATA SOURCES"
        subtitle={`${DATA_SOURCES.filter((d) => d.status === 'live').length} live APIs + ${DATA_SOURCES.filter((d) => d.status === 'static').length} local datasets`}
        onExpand={() => setExpanded('data-sources')}
      />
      <div className="px-2 pb-3">
        <div className="rounded-lg border border-white/[0.06] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[20px_1fr_44px_38px_1fr_40px_16px] gap-1 px-2 py-1.5 bg-white/[0.03] text-[7px] font-semibold text-white/30 uppercase tracking-wider">
            <span>#</span>
            <span>Source</span>
            <span>Type</span>
            <span>Auth</span>
            <span>Data</span>
            <span>Refresh</span>
            <span></span>
          </div>
          {/* Rows */}
          {DATA_SOURCES.map((ds) => (
            <div
              key={ds.id}
              className="grid grid-cols-[20px_1fr_44px_38px_1fr_40px_16px] gap-1 items-center px-2 py-1 border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-[7px] text-white/15 font-mono">{ds.id}</span>
              <span className="text-[8px] text-white/60 font-medium truncate">{ds.name}</span>
              <Badge text={ds.type.toUpperCase()} style={TYPE_STYLES[ds.type]} />
              <Badge text={ds.auth === 'none' ? '—' : 'KEY'} style={AUTH_STYLES[ds.auth]} />
              <span className="text-[7px] text-white/30 truncate">{ds.data}</span>
              <span className="text-[7px] text-white/20 font-mono">{ds.refresh}</span>
              <StatusDot ds={ds} healthServices={healthServices} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Separator ── */}
      <div className="border-t border-white/[0.04]" />

      {/* ── Agent Architecture Graph ── */}
      <SectionHeader
        icon="🧠"
        title="AGENT ARCHITECTURE"
        subtitle={`${AGENTS.length} agents · ${TOOLS.length} tools · ${ML_MODELS.length} ML models`}
        onExpand={() => setExpanded('agent-arch')}
      />
      <div className="px-2 pb-3">
        <Suspense fallback={
          <div className="h-[320px] rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
            <span className="text-[9px] text-white/20">Loading graph…</span>
          </div>
        }>
          <AgentGraph />
        </Suspense>
      </div>

      {/* ── Separator ── */}
      <div className="border-t border-white/[0.04]" />

      {/* ── Tool Inventory ── */}
      <SectionHeader
        icon="🔧"
        title="TOOL INVENTORY"
        subtitle={`${TOOLS.length} specialist tools across ${TOOL_GROUPS.length} departments`}
        onExpand={() => setExpanded('tool-inventory')}
      />
      <div className="px-2 pb-3">
        <div className="rounded-lg border border-white/[0.06] overflow-hidden">
          {TOOL_GROUPS.map((group) => (
            <ToolGroup key={group.specialist} specialist={group.specialist} tools={group.tools} />
          ))}
        </div>
      </div>

      {/* ── Separator ── */}
      <div className="border-t border-white/[0.04]" />

      {/* ── ML Models ── */}
      <SectionHeader
        icon="⚡"
        title="ML MODELS"
        subtitle="Physics-informed neural networks and ensemble risk scoring"
        onExpand={() => setExpanded('ml-models')}
      />
      <div className="px-2 pb-4 space-y-2">
        {ML_MODELS.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>

      {/* ── Fullscreen Modal ── */}
      {expanded && (
        <FullscreenModal
          section={expanded}
          onClose={() => setExpanded(null)}
          healthServices={healthServices}
        />
      )}
    </div>
  );
}
