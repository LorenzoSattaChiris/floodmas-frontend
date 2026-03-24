import { createContext, useContext, useRef, type MutableRefObject } from 'react';
import type maplibregl from 'maplibre-gl';

type MapRef = MutableRefObject<maplibregl.Map | null>;

const MapContext = createContext<MapRef | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  return <MapContext.Provider value={mapRef}>{children}</MapContext.Provider>;
}

export function useMapRef(): MapRef {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapRef must be inside MapProvider');
  return ctx;
}
