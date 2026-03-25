import { useState } from 'react';
import { Tip } from './Tip';

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
    group: 'River Discharge',
    items: [
      { color: '#ef4444', label: 'Very High (≥500 m³/s)' },
      { color: '#f97316', label: 'High (200–500)' },
      { color: '#eab308', label: 'Moderate (50–200)' },
      { color: '#14b8a6', label: 'Low-moderate (10–50)' },
      { color: '#67e8f9', label: 'Low (<10)' },
    ],
  },
  {
    group: 'Soil Moisture',
    items: [
      { color: '#7c2d12', label: 'Saturated (≥40%)' },
      { color: '#a16207', label: 'Very Wet (30–40%)' },
      { color: '#ca8a04', label: 'Moist (20–30%)' },
      { color: '#65a30d', label: 'Normal (10–20%)' },
      { color: '#86efac', label: 'Dry (<10%)' },
    ],
  },
  {
    group: 'Wind Gusts',
    items: [
      { color: '#ef4444', label: 'Storm (≥100 km/h)' },
      { color: '#f97316', label: 'Gale (70–100)' },
      { color: '#eab308', label: 'Strong (40–70)' },
      { color: '#60a5fa', label: 'Moderate (20–40)' },
      { color: '#93c5fd', label: 'Light (<20)' },
    ],
  },
  {
    group: 'Met Office Forecast',
    items: [
      { color: '#7c3aed', label: 'Heavy rain (≥4 mm/h)' },
      { color: '#ef4444', label: 'Moderate rain (2–4)' },
      { color: '#f97316', label: 'Light rain (0.5–2)' },
      { color: '#eab308', label: 'High prob (≥60%)' },
      { color: '#f59e0b', label: 'Default / Dry' },
    ],
  },
  {
    group: 'ERA5-Land Reanalysis',
    items: [
      { color: '#3b82f6', label: 'Heavy precip (≥2 mm/h)' },
      { color: '#60a5fa', label: 'Moderate precip (0.5–2)' },
      { color: '#92400e', label: 'Very wet soil (≥40%)' },
      { color: '#a16207', label: 'Wet soil (30–40%)' },
      { color: '#7c3aed', label: 'Default' },
    ],
  },
  {
    group: 'IMD Deprivation 2019',
    items: [
      { color: '#7f1d1d', label: 'Decile 1 — Most Deprived', shape: 'polygon' as const },
      { color: '#dc2626', label: 'Decile 3–4', shape: 'polygon' as const },
      { color: '#ca8a04', label: 'Decile 5–6', shape: 'polygon' as const },
      { color: '#65a30d', label: 'Decile 7–8', shape: 'polygon' as const },
      { color: '#166534', label: 'Decile 10 — Least Deprived', shape: 'polygon' as const },
    ],
  },
  {
    group: 'Other Layers',
    items: [
      { color: '#8b5cf6', label: 'Rainfall Stations', shape: 'circle' as const },
      { color: '#06b6d4', label: 'Tide Gauge Stations', shape: 'circle' as const },
      { color: '#0d9488', label: 'Groundwater Stations', shape: 'circle' as const },
      { color: '#e11d48', label: 'NRFA Gauging Stations', shape: 'circle' as const },
      { color: '#fbbf24', label: 'Flood Warning Areas', shape: 'polygon' as const },
      { color: '#e879f9', label: 'Flood Risk Areas (Defra)', shape: 'polygon' as const },
      { color: '#10b981', label: 'LLFA Boundaries (Strategy)', shape: 'polygon' as const },
      { color: '#64748b', label: 'LLFA Boundaries (No Data)', shape: 'polygon' as const },
      { color: '#2563eb', label: 'Main Rivers', shape: 'line' as const },
      { color: '#22c55e', label: 'Flood Defences', shape: 'line' as const },
      { color: '#f97316', label: 'Historic Flood Extent', shape: 'polygon' as const },
      { color: '#94a3b8', label: 'OS Light Map', shape: 'polygon' as const },
      { color: '#64748b', label: 'OS Road Map', shape: 'polygon' as const },
      { color: '#059669', label: 'OS Outdoor Map', shape: 'polygon' as const },
    ],
  },
];

export { LEGEND_ITEMS };

export default function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-[66px] left-[19px] z-20 pointer-events-auto" data-tour="map-legend">
      {open ? (
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-white shadow-xl max-w-[220px] max-h-[calc(100vh-90px)] flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Legend</span>
            <Tip text="Hide map legend" side="bottom">
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] opacity-40 hover:opacity-80 transition-opacity"
              >
                ✕
              </button>
            </Tip>
          </div>
          <div className="space-y-2.5 overflow-y-auto scrollbar-thin">
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
        <Tip text="Show map symbol and colour scale legend" side="right">
          <button
            onClick={() => setOpen(true)}
            className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-1.5 text-white text-[10px] font-semibold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity shadow-lg"
          >
            Legend
          </button>
        </Tip>
      )}
    </div>
  );
}

export function LegendSwatch({ color, shape = 'circle' }: { color: string; shape?: 'circle' | 'line' | 'polygon' }) {
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
