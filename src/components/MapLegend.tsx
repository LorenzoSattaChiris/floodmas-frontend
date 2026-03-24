import { useState } from 'react';

const LEGEND_ITEMS = [
  {
    group: 'Flood Warnings',
    items: [
      { color: '#ef4444', label: 'Severe Flood Warning' },
      { color: '#f97316', label: 'Flood Warning' },
      { color: '#eab308', label: 'Flood Alert' },
    ],
  },
  {
    group: 'Water Level Stations',
    items: [
      { color: '#ef4444', label: 'High / Near Record' },
      { color: '#eab308', label: 'Elevated' },
      { color: '#22c55e', label: 'Normal' },
      { color: '#0ea5e9', label: 'No data' },
    ],
  },
  {
    group: 'Precipitation',
    items: [
      { color: '#7c3aed', label: 'Heavy (≥8 mm/h)' },
      { color: '#ef4444', label: 'Moderate-heavy (4–8)' },
      { color: '#f97316', label: 'Moderate (2–4)' },
      { color: '#3b82f6', label: 'Light (0.5–2)' },
      { color: '#e2e8f0', label: 'None' },
    ],
  },
  {
    group: 'Other Layers',
    items: [
      { color: '#8b5cf6', label: 'Rainfall Stations', shape: 'circle' as const },
      { color: '#14b8a6', label: 'River Discharge', shape: 'circle' as const },
      { color: '#22c55e', label: 'Flood Defences', shape: 'line' as const },
      { color: '#f97316', label: 'Historic Flood Extent', shape: 'polygon' as const },
    ],
  },
];

export default function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-[72px] left-4 z-20 pointer-events-auto">
      {open ? (
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-white shadow-xl max-w-[220px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Legend</span>
            <button
              onClick={() => setOpen(false)}
              className="text-[10px] opacity-40 hover:opacity-80 transition-opacity"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2.5">
            {LEGEND_ITEMS.map((group) => (
              <div key={group.group}>
                <p className="text-[9px] font-semibold uppercase tracking-wider opacity-40 mb-1">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <LegendSwatch color={item.color} shape={'shape' in item ? item.shape : 'circle'} />
                      <span className="text-[10px] opacity-70">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-1.5 text-white text-[10px] font-semibold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity shadow-lg"
        >
          Legend
        </button>
      )}
    </div>
  );
}

function LegendSwatch({ color, shape = 'circle' }: { color: string; shape?: 'circle' | 'line' | 'polygon' }) {
  if (shape === 'line') {
    return (
      <span className="w-4 h-0.5 rounded-full flex-shrink-0" style={{ background: color }} />
    );
  }
  if (shape === 'polygon') {
    return (
      <span
        className="w-3 h-3 rounded-sm flex-shrink-0 border"
        style={{ background: `${color}33`, borderColor: color }}
      />
    );
  }
  return (
    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
  );
}
