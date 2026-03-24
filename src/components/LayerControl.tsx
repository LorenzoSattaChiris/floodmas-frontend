import { LAYER_CONFIGS, type LayerConfig } from '../config/layers';
import { useLayerStore } from '../stores/layerStore';
import {
  useFloodWarnings,
  useWaterLevelStations,
  useRainfallStations,
  usePrecipitationGrid,
  useFloodDefences,
  useHistoricFloods,
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

export default function LayerControl() {
  const { visibleLayers, toggleLayer, setAllLayers, leftPanelOpen } = useLayerStore();
  const { data: floods } = useFloodWarnings();
  const { data: levelStations } = useWaterLevelStations();
  const { data: rainStations } = useRainfallStations();
  const { data: precipGrid } = usePrecipitationGrid();
  const { data: defences } = useFloodDefences();
  const { data: historic } = useHistoricFloods();

  if (!leftPanelOpen) return null;

  const counts: Record<string, number | undefined> = {
    'flood-warnings': floods?.items?.length,
    'water-level-stations': levelStations?.items?.length,
    'rainfall-stations': rainStations?.items?.length,
    'precipitation': precipGrid?.points?.length,
    'flood-defences': defences?.features?.length,
    'historic-floods': historic?.features?.length,
  };

  const activeCount = visibleLayers.size;
  const groups = ['live', 'weather', 'risk', 'reference'] as const;

  return (
    <aside className="w-64 m-3 mr-0 glass rounded-2xl flex flex-col shrink-0 overflow-hidden pointer-events-auto panel-enter shadow-xl shadow-black/20">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-flood-textMuted">
            Map Layers
          </h2>
          <span className="text-[10px] tabular-nums text-flood-accent font-medium bg-flood-accent/10 px-2 py-0.5 rounded-full">
            {activeCount} active
          </span>
        </div>
        <div className="flex gap-3 mt-2.5">
          <button
            onClick={() => setAllLayers(true)}
            className="text-[10px] font-medium text-flood-accent hover:text-flood-accentHover transition-colors"
          >
            Show All
          </button>
          <button
            onClick={() => setAllLayers(false)}
            className="text-[10px] font-medium text-flood-textMuted/60 hover:text-flood-textMuted transition-colors"
          >
            Hide All
          </button>
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
            {LAYER_CONFIGS.filter((l) => l.group === group).map((layer) => (
              <LayerToggle
                key={layer.id}
                layer={layer}
                active={visibleLayers.has(layer.id)}
                count={counts[layer.id]}
                onToggle={() => toggleLayer(layer.id)}
              />
            ))}
          </div>
        ))}
      </div>

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
  onToggle,
}: {
  layer: LayerConfig;
  active: boolean;
  count?: number;
  onToggle: () => void;
}) {
  return (
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
          style={active ? { backgroundColor: layer.color, boxShadow: `0 0 8px ${layer.color}66` } : undefined}
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
          {count.toLocaleString()}
        </span>
      )}
    </button>
  );
}
