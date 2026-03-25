import { useState, useRef, useEffect } from 'react';
import { useLayerStore, type BaseMapStyle } from '../stores/layerStore';

interface BaseMapOption {
  id: BaseMapStyle;
  label: string;
  shortLabel: string;
  preview: string;
  accent: string;
}

const OPTIONS: BaseMapOption[] = [
  {
    id: 'default',
    label: 'Satellite Hybrid',
    shortLabel: 'Default',
    preview: '/basemaps/satellite.svg',
    accent: '#0ea5e9',
  },
  {
    id: 'os-map-light',
    label: 'OS Light',
    shortLabel: 'Light',
    preview: '/basemaps/light.svg',
    accent: '#94a3b8',
  },
  {
    id: 'os-map-road',
    label: 'OS Road',
    shortLabel: 'Road',
    preview: '/basemaps/road.svg',
    accent: '#64748b',
  },
  {
    id: 'os-map-outdoor',
    label: 'OS Outdoor',
    shortLabel: 'Outdoor',
    preview: '/basemaps/outdoor.svg',
    accent: '#059669',
  },
];

export default function BaseMapSelector() {
  const { baseMap, setBaseMap } = useLayerStore();
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  const active = OPTIONS.find((o) => o.id === baseMap) ?? OPTIONS[0];

  return (
    <div ref={panelRef} className="px-3 py-2">
      {/* Collapsed: current selection preview */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full group relative rounded-xl overflow-hidden transition-all duration-300 hover:ring-1 hover:ring-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-flood-accent/60"
        style={{ boxShadow: expanded ? `0 0 16px ${active.accent}22` : undefined }}
      >
        <div className="relative h-[52px] overflow-hidden rounded-xl">
          {/* Preview image */}
          <img
            src={active.preview}
            alt={active.label}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
          {/* Label */}
          <div className="relative z-10 h-full flex items-center px-3 gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/20"
                style={{ backgroundColor: active.accent, boxShadow: `0 0 6px ${active.accent}` }}
              />
              <span className="text-[11px] font-semibold text-white truncate">
                {active.label}
              </span>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-white/50 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded: option grid */}
      <div
        className={`grid grid-cols-2 gap-1.5 overflow-hidden transition-all duration-400 ease-out ${
          expanded ? 'max-h-[280px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        {OPTIONS.map((opt) => {
          const selected = baseMap === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                setBaseMap(opt.id);
                setExpanded(false);
              }}
              className={`
                group/card relative rounded-lg overflow-hidden transition-all duration-300
                focus:outline-none focus-visible:ring-2 focus-visible:ring-flood-accent/60
                ${selected
                  ? 'ring-[1.5px] shadow-lg scale-[1.02]'
                  : 'ring-1 ring-white/[0.08] hover:ring-white/20 hover:scale-[1.01]'}
              `}
              style={selected ? {
                boxShadow: `0 0 12px ${opt.accent}33, 0 2px 8px rgba(0,0,0,0.4)`,
                outline: `1.5px solid ${opt.accent}`,
                outlineOffset: '-1.5px',
              } : undefined}
            >
              {/* Preview thumbnail */}
              <div className="relative h-[56px] overflow-hidden">
                <img
                  src={opt.preview}
                  alt={opt.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  loading="lazy"
                />
                {/* Vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Selected checkmark */}
                {selected && (
                  <div
                    className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center basemap-check-enter"
                    style={{ backgroundColor: opt.accent, boxShadow: `0 0 8px ${opt.accent}88` }}
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Label bar */}
              <div className={`px-2 py-1.5 text-[10px] font-semibold tracking-wide text-center transition-colors ${
                selected ? 'text-white' : 'text-white/60 group-hover/card:text-white/80'
              }`}
                style={{ backgroundColor: selected ? `${opt.accent}18` : 'rgba(15,23,42,0.6)' }}
              >
                {opt.shortLabel}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
