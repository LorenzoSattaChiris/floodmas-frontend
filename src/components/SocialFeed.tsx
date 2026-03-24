import { useState } from 'react';
import { useFloodFeed } from '../hooks/useFloodData';
import { useLayerStore } from '../stores/layerStore';
import type { FeedItem } from '../services/api';

/** NLP-style keyword categories for semantic highlighting */
const NLP_CATEGORIES = [
  {
    label: 'hazard',
    pattern: /\b(flood|flooding|flooded|floodwater|flash flood|deluge|storm surge|inundation|overflow|waterlogged|submerged|rising water)\b/gi,
    cls: 'nlp-hazard',
  },
  {
    label: 'severity',
    pattern: /\b(severe|extreme|catastrophic|devastating|destructive|unprecedented|record-breaking|worst|major|critical)\b/gi,
    cls: 'nlp-severity',
  },
  {
    label: 'alert',
    pattern: /\b(warning|alert|evacuation|evacuate|emergency|danger|rescue|sandbag|shelter)\b/gi,
    cls: 'nlp-alert',
  },
  {
    label: 'weather',
    pattern: /\b(storm|rain|rainfall|downpour|thunder|cyclone|hurricane|typhoon|monsoon|precipitation|hail)\b/gi,
    cls: 'nlp-weather',
  },
  {
    label: 'location',
    pattern: /\b(river|coast|coastal|dam|levee|embankment|catchment|estuary|tributary|basin|channel)\b/gi,
    cls: 'nlp-location',
  },
];

const SEVERITY_STYLES: Record<number, { bg: string; text: string; ring: string; label: string }> = {
  1: { bg: 'bg-red-500/15', text: 'text-red-400', ring: 'ring-red-400/30', label: 'Severe' },
  2: { bg: 'bg-orange-500/15', text: 'text-orange-400', ring: 'ring-orange-400/30', label: 'Warning' },
  3: { bg: 'bg-amber-500/15', text: 'text-amber-400', ring: 'ring-amber-400/30', label: 'Alert' },
  4: { bg: 'bg-slate-500/15', text: 'text-slate-400', ring: 'ring-slate-400/30', label: 'Expired' },
};

export default function SocialFeed() {
  const rightPanelOpen = useLayerStore((s) => s.rightPanelOpen);
  const [expanded, setExpanded] = useState(false);
  const mode = expanded ? 'broad' : 'focused';
  const { data, isLoading, error, dataUpdatedAt } = useFloodFeed(mode);

  if (!rightPanelOpen) return null;

  const itemCount = data?.items?.length ?? 0;
  const eaCount = data?.sources?.ea ?? 0;
  const bskyCount = data?.sources?.bluesky ?? 0;

  return (
    <aside className="w-72 m-3 ml-0 glass rounded-2xl flex flex-col shrink-0 overflow-hidden pointer-events-auto panel-enter-right shadow-xl shadow-black/20">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-flood-textMuted">
            Flood Feed
          </h2>
          <div className="flex items-center gap-2">
            {itemCount > 0 && (
              <span className="text-[10px] tabular-nums text-blue-400 font-medium bg-blue-400/10 px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
        </div>
        {dataUpdatedAt > 0 && (
          <p className="text-[10px] text-flood-textMuted/30 mt-1.5">
            Updated {new Date(dataUpdatedAt).toLocaleTimeString('en-GB')}
          </p>
        )}
        {/* Warnings / All toggle */}
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={() => setExpanded(false)}
            className={`text-[9px] px-2 py-0.5 rounded-full font-medium transition-all ${
              !expanded
                ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/30'
                : 'text-flood-textMuted/40 hover:text-flood-textMuted/60'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setExpanded(true)}
            className={`text-[9px] px-2 py-0.5 rounded-full font-medium transition-all ${
              expanded
                ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/30'
                : 'text-flood-textMuted/40 hover:text-flood-textMuted/60'
            }`}
          >
            All Sources
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-3 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ItemSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 text-[11px] text-red-400/80 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            Unable to load flood feed
          </div>
        )}

        {data?.items && data.items.length === 0 && !isLoading && (
          <div className="p-6 text-center">
            <div className="text-2xl mb-2 opacity-30">✓</div>
            <p className="text-[11px] text-flood-textMuted/50">No active flood warnings</p>
            <p className="text-[9px] text-flood-textMuted/30 mt-1">All clear across England</p>
          </div>
        )}

        <div className="p-2 space-y-1.5">
          {data?.items?.map((item) =>
            item.source === 'ea' ? (
              <WarningCard key={item.id} item={item} />
            ) : (
              <PostCard key={item.id} item={item} />
            ),
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5">
        <p className="text-[8px] text-flood-textMuted/35">
          {eaCount > 0 && `${eaCount} EA warnings`}
          {eaCount > 0 && bskyCount > 0 && ' · '}
          {bskyCount > 0 && `${bskyCount} social posts`}
          {eaCount === 0 && bskyCount === 0 && 'Environment Agency · Bluesky'}
        </p>
      </div>
    </aside>
  );
}

/** EA Flood Warning card */
function WarningCard({ item }: { item: FeedItem }) {
  const sev = SEVERITY_STYLES[item.severityLevel ?? 3] ?? SEVERITY_STYLES[3];
  const details: string[] = [];
  if (item.river) details.push(item.river);
  if (item.county) details.push(item.county);
  if (item.isTidal) details.push('Tidal');

  return (
    <div className={`p-3 rounded-xl ${sev.bg} border border-transparent transition-all duration-200`}>
      {/* Severity badge + area */}
      <div className="flex items-start gap-2">
        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${sev.text} ring-1 ${sev.ring} shrink-0 mt-0.5`}>
          {sev.label}
        </span>
        <span className="text-[10px] font-medium text-flood-text leading-snug line-clamp-2">
          {item.area || item.severity}
        </span>
      </div>

      {/* Warning message */}
      <p className="text-[10px] text-flood-textMuted/70 leading-relaxed mt-1.5 line-clamp-3">
        <HighlightedText text={item.text} />
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-2 mt-2 text-[9px] text-flood-textMuted/40 flex-wrap">
        <span>{relativeTime(item.timestamp)}</span>
        {details.map((d) => (
          <span key={d} className="flex items-center gap-0.5">
            <span className="w-0.5 h-0.5 rounded-full bg-current" />
            {d}
          </span>
        ))}
        <span className="flex items-center gap-0.5 ml-auto">
          <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          EA
        </span>
      </div>
    </div>
  );
}

/** Bluesky social post card */
function PostCard({ item }: { item: FeedItem }) {
  const handle = item.author?.handle || '';
  const displayName = item.author?.displayName || handle;
  const avatar = item.author?.avatar;

  return (
    <a
      href={item.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all duration-200"
    >
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-white/10 shrink-0 overflow-hidden ring-1 ring-white/10">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-flood-textMuted/40">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] font-medium text-flood-text truncate">{displayName}</span>
            <span className="text-[9px] text-flood-textMuted/40 truncate">@{handle}</span>
          </div>

          <p className="text-[11px] text-flood-textMuted/80 leading-relaxed mt-1 break-words line-clamp-3">
            <HighlightedText text={item.text} />
          </p>

          <div className="flex items-center gap-3 mt-2 text-[9px] text-flood-textMuted/40">
            <span>{relativeTime(item.timestamp)}</span>
            {(item.likes ?? 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="text-red-400/60">&#9829;</span> {item.likes}
              </span>
            )}
            {(item.reposts ?? 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="text-emerald-400/60">&#10227;</span> {item.reposts}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

function HighlightedText({ text }: { text: string }) {
  // Build a combined pattern from all NLP categories
  const allPatterns = NLP_CATEGORIES.map((c) => c.pattern.source).join('|');
  const combined = new RegExp(`(${allPatterns})`, 'gi');

  const parts = text.split(combined).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        const cat = NLP_CATEGORIES.find((c) => {
          c.pattern.lastIndex = 0; // reset regex state
          return c.pattern.test(part);
        });
        if (cat) {
          cat.pattern.lastIndex = 0; // reset after test
          return <span key={i} className={cat.cls}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function ItemSkeleton() {
  return (
    <div className="flex items-start gap-2.5 animate-pulse p-3">
      <div className="w-7 h-7 rounded-full bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 bg-white/5 rounded w-1/3" />
        <div className="h-2.5 bg-white/5 rounded w-full" />
        <div className="h-2.5 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  );
}

function relativeTime(iso: string): string {
  if (!iso) return '';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}
