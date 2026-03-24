const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// --- EA Flood Monitoring ---

export interface FloodWarning {
  '@id': string;
  description: string;
  eaAreaName: string;
  eaRegionName: string;
  floodArea: {
    '@id': string;
    county: string;
    notation: string;
    polygon?: string;
    riverOrSea: string;
  };
  floodAreaID: string;
  isTidal: boolean;
  message: string;
  severity: string;
  severityLevel: number;
  timeMessageChanged: string;
  timeRaised: string;
  timeSeverityChanged: string;
}

export interface FloodsResponse {
  items: FloodWarning[];
}

export function fetchFloodWarnings(): Promise<FloodsResponse> {
  return fetchJSON('/floods');
}

export interface Station {
  '@id': string;
  RLOIid: string;
  catchmentName: string;
  dateOpened: string;
  label: string;
  lat: number;
  long: number;
  measures: unknown[];
  notation: string;
  riverName: string;
  stageScale?: {
    highestRecent?: { value: number };
    maxOnRecord?: { value: number };
    scaleMax: number;
    typicalRangeHigh: number;
    typicalRangeLow: number;
  };
  stationReference: string;
  status: string;
  town: string;
  wiskiID: string;
}

export interface StationsResponse {
  items: Station[];
}

export function fetchStations(params?: Record<string, string>): Promise<StationsResponse> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchJSON(`/stations${query}`);
}

export interface Reading {
  '@id': string;
  dateTime: string;
  measure: string;
  value: number;
}

export interface ReadingsResponse {
  items: Reading[];
}

export function fetchStationReadings(stationId: string): Promise<ReadingsResponse> {
  return fetchJSON(`/stations/${encodeURIComponent(stationId)}/readings`);
}

export function fetchLatestReadings(): Promise<ReadingsResponse> {
  return fetchJSON('/stations/readings/latest');
}

// --- Open-Meteo Weather ---

export interface PrecipitationPoint {
  lat: number;
  lon: number;
  name: string;
  current_rain_mm: number;
  rain_next_3h_mm: number;
  rain_next_6h_mm: number;
  temperature_c: number;
  wind_speed_kmh: number;
  wind_direction: number;
  weather_code: number;
}

export interface PrecipitationGrid {
  points: PrecipitationPoint[];
  generatedAt: string;
}

export function fetchPrecipitationGrid(): Promise<PrecipitationGrid> {
  return fetchJSON('/weather/precipitation');
}

export interface RiverDischargePoint {
  lat: number;
  lon: number;
  discharge_m3s: number;
  discharge_max_24h: number;
  discharge_max_72h: number;
}

export interface RiverDischargeData {
  points: RiverDischargePoint[];
  generatedAt: string;
}

export function fetchRiverDischarge(coords: Array<{ lat: number; lon: number }>): Promise<RiverDischargeData> {
  if (coords.length === 0) return Promise.resolve({ points: [], generatedAt: new Date().toISOString() });
  const lats = coords.map(c => c.lat).join(',');
  const lons = coords.map(c => c.lon).join(',');
  return fetchJSON(`/weather/river-discharge?lats=${lats}&lons=${lons}`);
}

// --- ArcGIS Feature Layers ---

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: Record<string, unknown>;
  }>;
}

export function fetchFloodDefences(bbox?: string): Promise<FeatureCollection> {
  const query = bbox ? `?bbox=${bbox}` : '';
  return fetchJSON(`/features/defences${query}`);
}

export function fetchHistoricFloods(bbox?: string): Promise<FeatureCollection> {
  const query = bbox ? `?bbox=${bbox}` : '';
  return fetchJSON(`/features/historic-floods${query}`);
}

// --- Flood Feed (EA Warnings + Bluesky) ---

export interface FeedItem {
  id: string;
  source: 'ea' | 'bluesky';
  text: string;
  timestamp: string;
  severity?: string;
  severityLevel?: number;
  area?: string;
  county?: string;
  river?: string;
  isTidal?: boolean;
  author?: {
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  likes?: number;
  reposts?: number;
  replies?: number;
  url?: string;
}

export interface FeedResponse {
  items: FeedItem[];
  sources: { ea: number; bluesky: number };
  generatedAt: string;
}

export function fetchFloodFeed(
  limit = 25,
  mode: 'focused' | 'broad' = 'focused',
): Promise<FeedResponse> {
  return fetchJSON(`/social/feed?limit=${limit}&mode=${mode}`);
}

// --- Health ---

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    environmentAgency: string;
    bluesky: string;
  };
}

export function fetchHealth(): Promise<HealthResponse> {
  return fetchJSON('/health');
}
