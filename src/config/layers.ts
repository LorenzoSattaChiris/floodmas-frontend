export const MAPTILER_KEY = 's8HO9kcqXZc8OE1NrxTF';

export const MAP_STYLE = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;

export const MAP_INITIAL_VIEW = {
  center: [-2.5, 54.5] as [number, number],
  zoom: 5.8,
  pitch: 0,
  bearing: 0,
};

/** WMS layer definitions for EA ArcGIS services */
export const WMS_LAYERS = {
  riskRiversSea: {
    url: 'https://environment.data.gov.uk/arcgis/services/EA/RiskOfFloodingFromRiversAndSea/MapServer/WMSServer',
    layers: '0',
    label: 'Flood Risk — Rivers & Sea',
  },
  riskSurfaceWater: {
    url: 'https://environment.data.gov.uk/arcgis/services/EA/RiskOfFloodingFromSurfaceWaterBasic/MapServer/WMSServer',
    layers: '0',
    label: 'Flood Risk — Surface Water',
  },
} as const;

/** ArcGIS Feature Service endpoints on Defra portal */
export const ARCGIS_FEATURES = {
  floodDefences: 'https://services.arcgis.com/JJzESW51TqeY9uat/ArcGIS/rest/services/SpatialFloodDefences/FeatureServer/0',
  historicFloods: 'https://services.arcgis.com/JJzESW51TqeY9uat/ArcGIS/rest/services/Recorded_Flood_Outlines/FeatureServer/0',
} as const;

export interface LayerConfig {
  id: string;
  label: string;
  group: 'live' | 'weather' | 'risk' | 'reference';
  color: string;
  defaultVisible: boolean;
  description?: string;
}

/**
 * Layer ordering follows a clear visual hierarchy:
 *  1. REFERENCE (bottom) — static historical/infrastructure context
 *  2. RISK (below live) — modelled risk zones, mostly raster
 *  3. WEATHER — precipitation overlay from Open-Meteo
 *  4. LIVE (top) — real-time flood warnings + station readings
 *
 * Within each group, layers are ordered from least to most urgent.
 */
export const LAYER_CONFIGS: LayerConfig[] = [
  // --- Live (real-time, highest priority) ---
  { id: 'flood-warnings', label: 'Flood Warnings & Alerts', group: 'live', color: '#dc2626', defaultVisible: true,
    description: 'Active EA flood warnings. Red = severe, orange = warning, yellow = alert.' },
  { id: 'water-level-stations', label: 'Water Level Stations', group: 'live', color: '#0ea5e9', defaultVisible: true,
    description: 'EA river gauges. Color shows reading vs typical range.' },
  { id: 'rainfall-stations', label: 'Rainfall Stations', group: 'live', color: '#8b5cf6', defaultVisible: false,
    description: 'EA rain gauges across England.' },

  // --- Weather (forecast/current conditions) ---
  { id: 'precipitation', label: 'Precipitation (Current)', group: 'weather', color: '#3b82f6', defaultVisible: true,
    description: 'Open-Meteo hourly precipitation. Circle size = rain intensity.' },
  { id: 'river-discharge', label: 'River Discharge Forecast', group: 'weather', color: '#14b8a6', defaultVisible: false,
    description: 'Open-Meteo 72h river discharge forecast.' },

  // --- Risk (modelled data) ---
  { id: 'risk-rivers-sea', label: 'Risk — Rivers & Sea', group: 'risk', color: '#7c3aed', defaultVisible: false,
    description: 'EA modelled flood risk from rivers and the sea.' },
  { id: 'risk-surface-water', label: 'Risk — Surface Water', group: 'risk', color: '#06b6d4', defaultVisible: false,
    description: 'EA modelled surface water flooding risk.' },

  // --- Reference (static/historical) ---
  { id: 'flood-defences', label: 'Flood Defences', group: 'reference', color: '#22c55e', defaultVisible: false,
    description: 'Defra spatial flood defences — walls, embankments, barriers.' },
  { id: 'historic-floods', label: 'Historic Flood Outlines', group: 'reference', color: '#f97316', defaultVisible: false,
    description: 'EA recorded flood event outlines.' },
];
