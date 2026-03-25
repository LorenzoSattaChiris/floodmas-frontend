import { useState, Fragment } from 'react';
import { LAYER_CONFIGS, type LayerConfig } from '../config/layers';
import { useLayerStore, type LLFAChoropleth } from '../stores/layerStore';
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
  useWFDCatchments,
  useNFMHotspots,
  useSchools,
  useHospitals,
  useBathingWaters,
  useRamsar,
  useWaterCompanyBoundaries,
  useEDMOverflows,
  useWINEPOverflows,
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
  const { data: rainStations } = useRainfallStations(visibleLayers.has('rainfall-stations'));
  const { data: precipGrid } = usePrecipitationGrid();
  const { data: dischargeGrid } = useRiverDischargeGrid(visibleLayers.has('river-discharge'));
  const { data: soilGrid } = useSoilMoistureGrid(visibleLayers.has('soil-moisture'));
  const { data: tideStations } = useTideGaugeStations(visibleLayers.has('tidal-stations'));
  const { data: groundwaterStations } = useGroundwaterStations(visibleLayers.has('groundwater-stations'));
  const { data: nrfaStations } = useNRFAStations(visibleLayers.has('nrfa-stations'));
  const { data: floodWarningAreas } = useFloodWarningAreas(visibleLayers.has('flood-warning-areas'));
  const { data: extendedWeather } = useExtendedWeather(visibleLayers.has('extended-weather'));
  const { data: metOfficeForecast } = useMetOfficeForecast(visibleLayers.has('met-office-forecast'));
  const { data: cdsReanalysis } = useCDSReanalysis(visibleLayers.has('cds-reanalysis'));
  const { data: defences } = useFloodDefences(visibleLayers.has('flood-defences'));
  const { data: historic } = useHistoricFloods(visibleLayers.has('historic-floods'));
  const { data: mainRivers } = useMainRivers(visibleLayers.has('main-rivers'));
  const { data: floodRiskAreas } = useFloodRiskAreas(visibleLayers.has('flood-risk-areas'));
  const { data: llfaBoundaries } = useLLFABoundaries(visibleLayers.has('llfa-boundaries'));
  const { data: wfdCatchments } = useWFDCatchments(visibleLayers.has('wfd-catchments'));
  const { data: nfmHotspots } = useNFMHotspots(visibleLayers.has('nfm-hotspots'));
  const { data: schools } = useSchools(visibleLayers.has('schools'));
  const { data: hospitals } = useHospitals(visibleLayers.has('hospitals'));
  const { data: bathingWaters } = useBathingWaters(visibleLayers.has('bathing-waters'));
  const { data: ramsarWetlands } = useRamsar(visibleLayers.has('ramsar-wetlands'));
  const { data: waterCompanyBoundaries } = useWaterCompanyBoundaries(visibleLayers.has('water-company-boundaries'));
  const { data: edmOverflows } = useEDMOverflows(visibleLayers.has('edm-overflows'));
  const { data: winepOverflows } = useWINEPOverflows(visibleLayers.has('winep-overflows'));

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
    'nfm-hotspots': nfmHotspots?.features?.length,
    'wfd-catchments': wfdCatchments?.features?.length,
    'schools': schools?.features?.length,
    'hospitals': hospitals?.features?.length,
    'bathing-waters': bathingWaters?.features?.length,
    'ramsar-wetlands': ramsarWetlands?.features?.length,
    'water-company-boundaries': waterCompanyBoundaries?.features?.length,
    'edm-overflows': edmOverflows?.features?.length,
    'winep-overflows': winepOverflows?.features?.length,
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
              <Fragment key={layer.id}>
              <LayerToggle
                key={layer.id}
                layer={layer}
                active={visibleLayers.has(layer.id)}
                count={counts[layer.id]}
                needsZoom={layer.group === 'risk' && mapZoom < (layer.id === 'imd-deprivation' ? 9 : 7)}
                onToggle={() => toggleLayer(layer.id)}
              />
              {layer.id === 'llfa-boundaries' && visibleLayers.has('llfa-boundaries') && (
                <LLFAChoroplethSelector />
              )}
              </Fragment>
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

const CHOROPLETH_OPTIONS: { value: LLFAChoropleth; label: string; icon: string }[] = [
  { value: 'none', label: 'Strategy', icon: '◎' },
  { value: 'defences', label: 'Defences', icon: '🛡' },
  { value: 'spend', label: 'Spend', icon: '£' },
  { value: 'risk', label: 'Risk', icon: '△' },
  { value: 'protected', label: 'Protected', icon: '🏠' },
];

function LLFAChoroplethSelector() {
  const { llfaChoropleth, setLLFAChoropleth } = useLayerStore();
  return (
    <div className="px-4 pb-2 pt-0.5 flex items-center gap-1 flex-wrap">
      <span className="text-[9px] text-flood-textMuted/50 mr-0.5">Color by:</span>
      {CHOROPLETH_OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setLLFAChoropleth(o.value)}
          className={`text-[9px] px-1.5 py-0.5 rounded transition-all ${
            llfaChoropleth === o.value
              ? 'bg-emerald-500/20 text-emerald-400 font-medium'
              : 'text-flood-textMuted/40 hover:text-flood-textMuted/60 hover:bg-white/5'
          }`}
        >
          <span className="mr-0.5">{o.icon}</span>{o.label}
        </button>
      ))}
    </div>
  );
}
