import { create } from 'zustand';
import { LAYER_CONFIGS } from '../config/layers';

export type LLFAChoropleth = 'none' | 'defences' | 'spend' | 'risk' | 'protected';

const TOGGLE_KEY = 'floodmas-panel-toggles';

function loadToggles(): { left: boolean; right: boolean } {
  try {
    const raw = localStorage.getItem(TOGGLE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { left: true, right: true };
}

function saveToggles(left: boolean, right: boolean) {
  try { localStorage.setItem(TOGGLE_KEY, JSON.stringify({ left, right })); } catch { /* quota */ }
}

export type BaseMapStyle = 'default' | 'os-map-light' | 'os-map-road' | 'os-map-outdoor';

const OS_MAP_IDS: BaseMapStyle[] = ['os-map-light', 'os-map-road', 'os-map-outdoor'];

interface LayerState {
  visibleLayers: Set<string>;
  baseMap: BaseMapStyle;
  mapZoom: number;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  toggleLayer: (id: string) => void;
  setAllLayers: (visible: boolean) => void;
  setBaseMap: (style: BaseMapStyle) => void;
  setMapZoom: (zoom: number) => void;
  llfaChoropleth: LLFAChoropleth;
  setLLFAChoropleth: (mode: LLFAChoropleth) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

const defaultVisible = new Set(
  LAYER_CONFIGS.filter((l) => l.defaultVisible).map((l) => l.id),
);

const savedToggles = loadToggles();

export const useLayerStore = create<LayerState>((set) => ({
  visibleLayers: defaultVisible,
  baseMap: 'default',
  mapZoom: 5.8,
  leftPanelOpen: savedToggles.left,
  rightPanelOpen: savedToggles.right,
  llfaChoropleth: 'none' as LLFAChoropleth,

  toggleLayer: (id) =>
    set((state) => {
      const next = new Set(state.visibleLayers);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { visibleLayers: next };
    }),

  setAllLayers: (visible) =>
    set((state) => ({
      visibleLayers: visible
        ? new Set(LAYER_CONFIGS.filter((l) => !OS_MAP_IDS.includes(l.id as BaseMapStyle)).map((l) => l.id).concat(
            state.baseMap !== 'default' ? [state.baseMap] : [],
          ))
        : new Set<string>(state.baseMap !== 'default' ? [state.baseMap] : []),
    })),

  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  setBaseMap: (style) =>
    set((state) => {
      const next = new Set(state.visibleLayers);
      for (const id of OS_MAP_IDS) next.delete(id);
      if (style !== 'default') next.add(style);
      return { baseMap: style, visibleLayers: next };
    }),

  setLLFAChoropleth: (mode) => set({ llfaChoropleth: mode }),

  toggleLeftPanel: () => set((s) => {
    const next = !s.leftPanelOpen;
    saveToggles(next, s.rightPanelOpen);
    return { leftPanelOpen: next };
  }),
  toggleRightPanel: () => set((s) => {
    const next = !s.rightPanelOpen;
    saveToggles(s.leftPanelOpen, next);
    return { rightPanelOpen: next };
  }),
}));
