import { create } from 'zustand';
import { LAYER_CONFIGS } from '../config/layers';

interface LayerState {
  visibleLayers: Set<string>;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  toggleLayer: (id: string) => void;
  setAllLayers: (visible: boolean) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

const defaultVisible = new Set(
  LAYER_CONFIGS.filter((l) => l.defaultVisible).map((l) => l.id),
);

export const useLayerStore = create<LayerState>((set) => ({
  visibleLayers: defaultVisible,
  leftPanelOpen: true,
  rightPanelOpen: true,

  toggleLayer: (id) =>
    set((state) => {
      const next = new Set(state.visibleLayers);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { visibleLayers: next };
    }),

  setAllLayers: (visible) =>
    set(() => ({
      visibleLayers: visible
        ? new Set(LAYER_CONFIGS.map((l) => l.id))
        : new Set<string>(),
    })),

  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
}));
