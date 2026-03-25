export const MAPTILER_KEY = 's8HO9kcqXZc8OE1NrxTF';

export const MAP_STYLE = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;

export const MAP_INITIAL_VIEW = {
  center: [-2.5, 54.5] as [number, number],
  zoom: 5.8,
  pitch: 0,
  bearing: 0,
};

/** OS Maps ZXY tile URLs — proxied through Express to avoid CORS */
export const OS_TILE_LAYERS = {
  road: {
    url: '/api/tiles/os/Road_3857/{z}/{x}/{y}.png',
    label: 'OS Road Map',
  },
  outdoor: {
    url: '/api/tiles/os/Outdoor_3857/{z}/{x}/{y}.png',
    label: 'OS Outdoor Map',
  },
  light: {
    url: '/api/tiles/os/Light_3857/{z}/{x}/{y}.png',
    label: 'OS Light Map',
  },
} as const;

/** ArcGIS tile layer URLs — proxied through Express to avoid CORS */
export const WMS_LAYERS = {
  riskRiversSea: {
    url: '/api/tiles/ea/RiskOfFloodingFromRiversAndSea/{z}/{x}/{y}',
    label: 'Flood Risk — Rivers & Sea',
  },
  riskSurfaceWater: {
    url: '/api/tiles/ea/RiskOfFloodingFromSurfaceWater/{z}/{x}/{y}',
    label: 'Flood Risk — Surface Water',
  },
  floodZone2: {
    url: '/api/tiles/ea/FloodMapForPlanningRiversAndSeaFloodZone2/{z}/{x}/{y}',
    label: 'Flood Zone 2 (Medium Risk)',
  },
  floodZone3: {
    url: '/api/tiles/ea/FloodMapForPlanningRiversAndSeaFloodZone3/{z}/{x}/{y}',
    label: 'Flood Zone 3 (High Risk)',
  },
  reservoirDryDay: {
    url: '/api/tiles/ea/ReservoirFloodExtentsDryDay/{z}/{x}/{y}',
    label: 'Reservoir Flood Extents (Dry Day)',
  },
  reservoirWetDay: {
    url: '/api/tiles/ea/ReservoirFloodExtentsWetDay/{z}/{x}/{y}',
    label: 'Reservoir Flood Extents (Wet Day)',
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
  { id: 'tidal-stations', label: 'Tide Gauge Stations', group: 'live', color: '#06b6d4', defaultVisible: false,
    description: 'EA coastal tide gauge stations monitoring tidal levels.' },
  { id: 'groundwater-stations', label: 'Groundwater Stations', group: 'live', color: '#0d9488', defaultVisible: false,
    description: 'EA groundwater level monitoring stations.' },
  { id: 'nrfa-stations', label: 'NRFA Flow Gauges', group: 'live', color: '#e11d48', defaultVisible: false,
    description: 'UKCEH National River Flow Archive gauging stations (~1500+).' },

  // --- Weather (forecast/current conditions) ---
  { id: 'precipitation', label: 'Precipitation (Current)', group: 'weather', color: '#3b82f6', defaultVisible: true,
    description: 'Open-Meteo hourly precipitation. Circle size = rain intensity.' },
  { id: 'river-discharge', label: 'River Discharge Forecast', group: 'weather', color: '#14b8a6', defaultVisible: false,
    description: 'Open-Meteo 72h river discharge forecast.' },
  { id: 'soil-moisture', label: 'Soil Moisture', group: 'weather', color: '#a16207', defaultVisible: false,
    description: 'Open-Meteo soil saturation (0–7 cm). High values increase flood risk.' },
  { id: 'extended-weather', label: 'Snow & Wind Gusts', group: 'weather', color: '#60a5fa', defaultVisible: false,
    description: 'Open-Meteo snow depth, wind gusts, pressure & cloud cover.' },
  { id: 'met-office-forecast', label: 'Met Office Forecast', group: 'weather', color: '#f59e0b', defaultVisible: false,
    description: 'Official Met Office hourly forecast — temperature, wind, rain probability, UV.' },
  { id: 'cds-reanalysis', label: 'ERA5-Land Reanalysis', group: 'weather', color: '#7c3aed', defaultVisible: false,
    description: 'Copernicus ERA5-Land reanalysis — temperature, precipitation, soil moisture, snow cover.' },

  // --- Risk (modelled data) ---
  { id: 'risk-rivers-sea', label: 'Risk — Rivers & Sea', group: 'risk', color: '#7c3aed', defaultVisible: false,
    description: 'EA modelled flood risk from rivers and the sea.' },
  { id: 'risk-surface-water', label: 'Risk — Surface Water', group: 'risk', color: '#06b6d4', defaultVisible: false,
    description: 'EA modelled surface water flooding risk.' },
  { id: 'flood-zone-2', label: 'Flood Zone 2 (Medium)', group: 'risk', color: '#818cf8', defaultVisible: false,
    description: 'EA Flood Zone 2 — medium probability of flooding from rivers & sea.' },
  { id: 'flood-zone-3', label: 'Flood Zone 3 (High)', group: 'risk', color: '#c084fc', defaultVisible: false,
    description: 'EA Flood Zone 3 — high probability of flooding from rivers & sea.' },
  { id: 'reservoir-dry', label: 'Reservoir Extents (Dry)', group: 'risk', color: '#f472b6', defaultVisible: false,
    description: 'EA modelled reservoir flood extents — dry day scenario.' },
  { id: 'reservoir-wet', label: 'Reservoir Extents (Wet)', group: 'risk', color: '#fb7185', defaultVisible: false,
    description: 'EA modelled reservoir flood extents — wet day scenario.' },
  { id: 'flood-warning-areas', label: 'Flood Warning Areas', group: 'risk', color: '#fbbf24', defaultVisible: false,
    description: 'EA flood warning area boundaries — geographic extent of flood warnings.' },
  { id: 'flood-risk-areas', label: 'Flood Risk Areas (Defra)', group: 'risk', color: '#e879f9', defaultVisible: false,
    description: 'Defra/EA Flood Risk Areas — Areas of Potentially Significant Flood Risk (APSFR).' },
  { id: 'llfa-boundaries', label: 'LLFA Boundaries', group: 'risk', color: '#10b981', defaultVisible: false,
    description: 'Lead Local Flood Authority boundaries with LFRMS strategy data. Click for info card.' },
  { id: 'imd-deprivation', label: 'IMD Deprivation (2019)', group: 'risk', color: '#f43f5e', defaultVisible: false,
    description: 'ONS English Indices of Multiple Deprivation 2019 — LSOA deciles (1=most deprived). Reveals compound flood+deprivation vulnerability.' },

  // --- Reference (static/historical) ---
  { id: 'flood-defences', label: 'Flood Defences', group: 'reference', color: '#22c55e', defaultVisible: false,
    description: 'Defra spatial flood defences — walls, embankments, barriers.' },
  { id: 'historic-floods', label: 'Historic Flood Outlines', group: 'reference', color: '#f97316', defaultVisible: false,
    description: 'EA recorded flood event outlines.' },
  { id: 'main-rivers', label: 'Main Rivers', group: 'reference', color: '#2563eb', defaultVisible: false,
    description: 'Statutory main rivers managed by the Environment Agency.' },
  { id: 'os-map-light', label: 'OS Light Map', group: 'reference', color: '#94a3b8', defaultVisible: false,
    description: 'Ordnance Survey Light style — clean, neutral UK base mapping.' },
  { id: 'os-map-road', label: 'OS Road Map', group: 'reference', color: '#64748b', defaultVisible: false,
    description: 'Ordnance Survey Road style — road-focused UK mapping.' },
  { id: 'os-map-outdoor', label: 'OS Outdoor Map', group: 'reference', color: '#059669', defaultVisible: false,
    description: 'Ordnance Survey Outdoor style — topographic detail, contours, terrain.' },
];
