import { useState } from 'react';
import { LAYER_CONFIGS, type LayerConfig } from '../config/layers';
import { useLayerStore } from '../stores/layerStore';
import { Tip } from './Tip';
import BaseMapSelector from './BaseMapSelector';
import { LEGEND_ITEMS, LegendSwatch } from './MapLegend';
import {
  useFloodWarnings,
  useWaterLevelStations,
  useRainfallStations,
  usePrecipitationGrid,
  useRiverDischargeGrid,
  useSoilMoistureGrid,
  useTideGaugeStations,
  useGroundwaterStations,
  useNRFAStations,
  useFloodWarningAreas,
  useExtendedWeather,
  useMetOfficeForecast,
  useCDSReanalysis,
  useFloodDefences,
  useHistoricFloods,
  useMainRivers,
  useFloodRiskAreas,
  useLLFABoundaries,
} from '../hooks/useFloodData';

const GROUP_LABELS: Record<string, string> = {
  live: 'Live Data',
  weather: 'Weather',
  risk: 'Risk Layers',
  reference: 'Reference',
};

const GROUP_ICONS: Record<string, string> = {
  live: '◉',
  weather: '◈',
  risk: '△',
  reference: '◎',
};

const OS_MAP_IDS = new Set(['os-map-light', 'os-map-road', 'os-map-outdoor']);

export default function LayerControl() {
  const { visibleLayers, toggleLayer, setAllLayers, leftPanelOpen, mapZoom } = useLayerStore();
  const { data: floods } = useFloodWarnings();
  const { data: levelStations } = useWaterLevelStations();
  const { data: rainStations } = useRainfallStations();
  const { data: precipGrid } = usePrecipitationGrid();
  const { data: dischargeGrid } = useRiverDischargeGrid();
  const { data: soilGrid } = useSoilMoistureGrid();
  const { data: tideStations } = useTideGaugeStations();
  const { data: groundwaterStations } = useGroundwaterStations();
  const { data: nrfaStations } = useNRFAStations();
  const { data: floodWarningAreas } = useFloodWarningAreas();
  const { data: extendedWeather } = useExtendedWeather();
  const { data: metOfficeForecast } = useMetOfficeForecast();
  const { data: cdsReanalysis } = useCDSReanalysis();
  const { data: defences } = useFloodDefences();
  const { data: historic } = useHistoricFloods();
  const { data: mainRivers } = useMainRivers();
  const { data: floodRiskAreas } = useFloodRiskAreas();
  const { data: llfaBoundaries } = useLLFABoundaries();

  if (!leftPanelOpen) return null;

  const counts: Record<string, number | string | undefined> = {
    'flood-warnings': floods?.items?.length,
    'water-level-stations': levelStations?.items?.length,
    'rainfall-stations': rainStations?.items?.length,
    'tidal-stations': tideStations?.items?.length,
    'groundwater-stations': groundwaterStations?.items?.length,
    'nrfa-stations': nrfaStations?.stations?.length,
    'precipitation': precipGrid?.points?.length,
    'river-discharge': dischargeGrid?.points?.length,
    'soil-moisture': soilGrid?.points?.length,
    'extended-weather': extendedWeather?.points?.length,
    'met-office-forecast': metOfficeForecast?.points?.length,
    'cds-reanalysis': cdsReanalysis?.points?.length,
    'flood-warning-areas': floodWarningAreas?.items?.length,
    'flood-defences': defences?.features?.length,
    'historic-floods': historic?.features?.length,
    'main-rivers': mainRivers?.features?.length,
    'flood-risk-areas': floodRiskAreas?.features?.length,
    'llfa-boundaries': llfaBoundaries?.features?.length,
    'imd-deprivation': '1000+',
  };

  const activeCount = visibleLayers.size;
  const groups = ['live', 'weather', 'risk', 'reference'] as const;

  return (
    <aside className="w-full h-full glass rounded-2xl flex flex-col overflow-hidden pointer-events-auto panel-enter shadow-xl shadow-black/20" data-tour="layer-control">
      {/* Header — drag handle */}
      <div className="px-4 py-3.5 border-b border-white/5" data-drag-handle>
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-flood-textMuted">
            Map Layers
          </h2>
          <span className="text-[10px] tabular-nums text-flood-accent font-medium bg-flood-accent/10 px-2 py-0.5 rounded-full">
            {activeCount} active
          </span>
        </div>
        <div className="flex gap-3 mt-2.5">
          <Tip text="Enable all map data layers at once" side="bottom">
            <button
              onClick={() => setAllLayers(true)}
              className="text-[10px] font-medium text-flood-accent hover:text-flood-accentHover transition-colors"
            >
              Show All
            </button>
          </Tip>
          <Tip text="Hide all active map layers" side="bottom">
            <button
              onClick={() => setAllLayers(false)}
              className="text-[10px] font-medium text-flood-textMuted/60 hover:text-flood-textMuted transition-colors"
            >
              Hide All
            </button>
          </Tip>
        </div>
      </div>

      {/* Layer groups */}
      <div className="flex-1 overflow-y-auto py-1">
        {groups.map((group) => (
          <div key={group} className="mb-1">
            <div className="px-4 py-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-flood-textMuted/40 flex items-center gap-1.5">
                <span className="text-[11px]">{GROUP_ICONS[group]}</span>
                {GROUP_LABELS[group]}
              </span>
            </div>
            {/* Base Map selector replaces OS map toggles in Reference group */}
            {LAYER_CONFIGS
              .filter((l) => l.group === group && !OS_MAP_IDS.has(l.id))
              .map((layer) => (
              <LayerToggle
                key={layer.id}
                layer={layer}
                active={visibleLayers.has(layer.id)}
                count={counts[layer.id]}
                needsZoom={layer.group === 'risk' && mapZoom < (layer.id === 'imd-deprivation' ? 9 : 7)}
                onToggle={() => toggleLayer(layer.id)}
              />
            ))}
            {group === 'reference' && <BaseMapSelector />}
          </div>
        ))}
      </div>

      {/* Inline Legend — collapsible */}
      <LegendSection />

      {/* Attribution */}
      <div className="px-4 py-2.5 border-t border-white/5">
        <p className="text-[8px] text-flood-textMuted/35 leading-relaxed">
          Data: Environment Agency © OGL v3.0 · Map: © MapTiler © OpenStreetMap
        </p>
      </div>
    </aside>
  );
}

function LayerToggle({
  layer,
  active,
  count,
  needsZoom,
  onToggle,
}: {
  layer: LayerConfig;
  active: boolean;
  count?: number | string;
  needsZoom?: boolean;
  onToggle: () => void;
}) {
  return (
    <Tip text={layer.description ?? layer.label} side="right" wrap="block">
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-all duration-200 group ${
        active
          ? 'bg-white/[0.04]'
          : 'hover:bg-white/[0.02]'
      }`}
    >
      {/* Toggle indicator */}
      <div className={`w-7 h-4 rounded-full shrink-0 relative transition-all duration-300 ${
        active ? '' : 'bg-white/10'
      }`} style={active ? { backgroundColor: `${layer.color}33` } : undefined}>
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
            active ? 'left-3.5' : 'left-0.5 bg-white/30'
          }`}
          style={active ? { backgroundColor: layer.color, boxShadow: `0 0 5px ${layer.color}, 0 0 10px ${layer.color}88` } : undefined}
        />
      </div>

      {/* Label */}
      <span className={`text-[11px] flex-1 transition-colors ${
        active ? 'text-flood-text font-medium' : 'text-flood-textMuted/70 group-hover:text-flood-textMuted'
      }`}>
        {layer.label}
      </span>

      {/* Count badge */}
      {count !== undefined && (
        <span className={`text-[9px] tabular-nums font-mono px-1.5 py-0.5 rounded transition-colors ${
          active ? 'text-flood-accent bg-flood-accent/10' : 'text-flood-textMuted/40 bg-white/5'
        }`}>
          {typeof count === 'number' ? count.toLocaleString() : count}
        </span>
      )}

      {/* Zoom-in hint for risk layers */}
      {needsZoom && active && (
        <span className="text-[8px] text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded whitespace-nowrap">
          zoom in
        </span>
      )}
      </button>
    </Tip>
  );
}

function LegendSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/5" data-tour="map-legend">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-flood-textMuted/40 flex items-center gap-1.5">
          <span className="text-[11px]">◇</span>
          Legend
        </span>
        <svg
          className={`w-3 h-3 text-flood-textMuted/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-2.5 max-h-[40vh] overflow-y-auto scrollbar-thin">
          {LEGEND_ITEMS.map((group) => (
            <div key={group.group}>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-flood-textMuted/40 mb-1">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <LegendSwatch color={item.color} shape={'shape' in item ? item.shape : 'circle'} />
                    <span className="text-[10px] text-flood-textMuted/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
