const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Global fetch concurrency limiter ─────────────────────────────
// Prevents the browser from sending more than MAX_CONCURRENT requests
// to the API at once (e.g. when "Show All" enables every layer).
const MAX_CONCURRENT = 4;
let running = 0;
const queue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (running < MAX_CONCURRENT) { running++; return Promise.resolve(); }
  return new Promise<void>((resolve) => queue.push(resolve));
}

function releaseSlot() {
  running--;
  const next = queue.shift();
  if (next) { running++; next(); }
}

async function fetchJSON<T>(path: string): Promise<T> {
  await acquireSlot();
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } finally {
    releaseSlot();
  }
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

export function fetchRiverDischargeGrid(): Promise<RiverDischargeData> {
  return fetchJSON('/weather/river-discharge');
}

// --- Soil Moisture ---

export interface SoilMoisturePoint {
  lat: number;
  lon: number;
  name: string;
  moisture_0_7cm: number;
  moisture_7_28cm: number;
  temperature_c: number;
}

export interface SoilMoistureGrid {
  points: SoilMoisturePoint[];
  generatedAt: string;
}

export function fetchSoilMoistureGrid(): Promise<SoilMoistureGrid> {
  return fetchJSON('/weather/soil-moisture');
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

export function fetchMainRivers(bbox?: string): Promise<FeatureCollection> {
  const query = bbox ? `?bbox=${bbox}` : '';
  return fetchJSON(`/features/main-rivers${query}`);
}

export function fetchRiskLayerFeatures(layer: string, bbox?: string): Promise<FeatureCollection> {
  const query = bbox ? `?bbox=${bbox}` : '';
  return fetchJSON(`/features/risk/${layer}${query}`);
}

export function fetchTideGaugeStations(): Promise<StationsResponse> {
  return fetchJSON('/stations?type=TideGauge&_limit=500');
}

export function fetchGroundwaterStations(): Promise<StationsResponse> {
  return fetchJSON('/stations?parameter=groundwater-level&_limit=500');
}

// --- NRFA (National River Flow Archive) ---

export interface NRFAStation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  river: string;
  catchmentArea: number | null;
}

export interface NRFAStationsResponse {
  stations: NRFAStation[];
  generatedAt: string;
}

export function fetchNRFAStations(): Promise<NRFAStationsResponse> {
  return fetchJSON('/nrfa/stations');
}

// --- EA Flood Warning Areas ---

export interface FloodArea {
  '@id': string;
  county: string;
  description: string;
  envelope?: {
    lowerCorner: string;
    upperCorner: string;
  };
  fwdCode: string;
  label: string;
  lat: number;
  long: number;
  notation: string;
  polygon?: string;
  quickDialNumber: string;
  riverOrSea: string;
  type: string;
}

export interface FloodAreasResponse {
  items: FloodArea[];
}

export function fetchFloodWarningAreas(): Promise<FloodAreasResponse> {
  return fetchJSON('/flood-areas?type=FloodWarningArea');
}

// --- Extended Weather ---

export interface ExtendedWeatherPoint {
  lat: number;
  lon: number;
  name: string;
  snow_depth_m: number;
  wind_gusts_kmh: number;
  surface_pressure_hpa: number;
  cloud_cover_pct: number;
}

export interface ExtendedWeatherGrid {
  points: ExtendedWeatherPoint[];
  generatedAt: string;
}

export function fetchExtendedWeatherGrid(): Promise<ExtendedWeatherGrid> {
  return fetchJSON('/weather/extended');
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
  datasetsReady?: boolean;
}

export function fetchHealth(): Promise<HealthResponse> {
  return fetchJSON('/health');
}

// --- Met Office Weather DataHub ---

export interface MetOfficeForecastEntry {
  time: string;
  screenTemperature: number;
  feelsLikeTemperature: number;
  windSpeed10m: number;
  windDirectionFrom10m: number;
  windGustSpeed10m: number;
  visibility: number;
  screenRelativeHumidity: number;
  mslp: number;
  uvIndex: number;
  significantWeatherCode: number;
  precipitationRate: number;
  totalPrecipAmount: number;
  totalSnowAmount: number;
  probOfPrecipitation: number;
}

export interface MetOfficeForecastPoint {
  lat: number;
  lon: number;
  name: string;
  modelRunDate: string;
  current: MetOfficeForecastEntry;
  next3h: MetOfficeForecastEntry | null;
}

export interface MetOfficeForecastGrid {
  points: MetOfficeForecastPoint[];
  generatedAt: string;
}

export function fetchMetOfficeForecast(): Promise<MetOfficeForecastGrid> {
  return fetchJSON('/metoffice/forecast');
}

// --- Copernicus CDS ERA5-Land Reanalysis ---

export interface CDSReanalysisPoint {
  lat: number;
  lon: number;
  name: string;
  temperature_c: number;
  precipitation_mm_h: number;
  soil_moisture_m3m3: number;
  snow_cover_pct: number;
  data_time: string;
}

export interface CDSReanalysisGrid {
  points: CDSReanalysisPoint[];
  generatedAt: string;
  dataTimestamp: string;
}

export function fetchCDSReanalysis(): Promise<CDSReanalysisGrid> {
  return fetchJSON('/cds/reanalysis');
}

// --- Ordnance Survey Names API ---

export interface OSPlaceResult {
  name: string;
  type: string;
  localType: string;
  lat: number;
  lon: number;
  county: string;
  region: string;
  country: string;
  populatedPlace: string;
  postcodeDistrict: string;
}

export interface OSSearchResponse {
  results: OSPlaceResult[];
  totalResults: number;
  query: string;
}

export function fetchOSPlaceSearch(query: string, limit = 10): Promise<OSSearchResponse> {
  return fetchJSON(`/os/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

// --- Agent Chat ---

export interface ChatStartResponse {
  sessionId: string;
}

export async function startChat(message: string): Promise<ChatStartResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export function chatEventStreamUrl(sessionId: string): string {
  return `${BASE_URL}/chat/${sessionId}`;
}

// --- Agent Cards ---

export interface AgentCardResponse {
  name: string;
  description: string;
  version: string;
  role: 'supervisor' | 'worker';
  agentType: string;
  iconUrl: string;
  skills: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
    examples: string[];
  }>;
  capabilities: {
    streaming: boolean;
    tools?: string[];
    multiAgentDelegation?: boolean;
    proactiveMonitoring?: boolean;
  };
}

export function fetchAgentCards(): Promise<AgentCardResponse[]> {
  return fetchJSON('/agents');
}

// --- Proactive Monitoring ---

export async function startProactiveScan(): Promise<ChatStartResponse> {
  const res = await fetch(`${BASE_URL}/proactive/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Proactive API error: ${res.status}`);
  return res.json();
}

export function proactiveEventStreamUrl(sessionId: string): string {
  return `${BASE_URL}/proactive/${sessionId}`;
}

// --- Report Generation ---

export async function startReportGeneration(conversationSummary: string): Promise<ChatStartResponse> {
  const res = await fetch(`${BASE_URL}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationSummary }),
  });
  if (!res.ok) throw new Error(`Report API error: ${res.status}`);
  return res.json();
}

export function reportEventStreamUrl(sessionId: string): string {
  return `${BASE_URL}/report/${sessionId}`;
}

// --- Local Datasets (GOV.UK / NAO / Defra) ---

export interface FloodRiskAreasGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: {
      fra_id: string;
      fra_name: string;
      frr_cycle: number;
      flood_source: string;
    };
  }>;
}

export function fetchFloodRiskAreas(): Promise<FloodRiskAreasGeoJSON> {
  return fetchJSON('/datasets/flood-risk-areas');
}

export interface DatasetSummary {
  defences: { regions: number; utlas: number };
  spend: { regions: number; utlas: number };
  homesProtected: { regions: number; utlas: number };
  propertiesAtRisk: { constituencies: number; ltlas: number; utlas: number };
  floodRiskAreas: { features: number };
  postcodeRisk: { postcodes: number };
  propertyRisk: { totalProperties: number };
  wfdCatchments: { features: number };
  nfmHotspots: { features: number };
  schools: { features: number };
  hospitals: { features: number };
  bathingWaters: { features: number };
  ramsar: { features: number };
  waterCompanyBoundaries: { features: number };
  edmOverflows: { features: number };
  winepOverflows: { features: number };
}

export function fetchDatasetSummary(): Promise<DatasetSummary> {
  return fetchJSON('/datasets/summary');
}

// --- RoFRS Postcode Risk Lookup ---

interface RiskBandBreakdown {
  residential: number;
  nonResidential: number;
  unclassified: number;
  total: number;
}

export interface PostcodeRisk {
  postcode: string;
  totalProperties: number;
  residential: number;
  nonResidential: number;
  unclassified: number;
  veryLow: RiskBandBreakdown;
  low: RiskBandBreakdown;
  medium: RiskBandBreakdown;
  high: RiskBandBreakdown;
}

export function fetchPostcodeRisk(postcode: string): Promise<PostcodeRisk> {
  return fetchJSON(`/datasets/postcode-risk?pc=${encodeURIComponent(postcode)}`);
}

export function fetchPostcodeRiskSearch(query: string, limit = 20): Promise<PostcodeRisk[]> {
  return fetchJSON(`/datasets/postcode-risk/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

// --- RoFRS Property Risk Summary ---

export interface PropertyRiskSummary {
  totalProperties: number;
  byType: { residential: number; nonResidential: number; unclassified: number };
  byRisk: { veryLow: number; low: number; medium: number; high: number };
  byTypeAndRisk: Record<string, Record<string, number>>;
}

export function fetchPropertyRiskSummary(): Promise<PropertyRiskSummary> {
  return fetchJSON('/datasets/properties-risk-summary');
}

// --- LLFA (Lead Local Flood Authority) Boundaries & Strategy Info ---

export interface LLFAStrategyInfo {
  yearPublished: number | null;
  hasBeenUpdated: string;
  isLivingDocument: string;
  activePeriod: string;
  wordCount: number | null;
  hasCoverSheet: string;
  externalConsultant: string;
  isCoastalArea: string;
  stakeholders: {
    idbMentions: number | null;
    nationalHighwaysMentions: number | null;
    waterCompanyMentions: string;
    rfccMentions: number | null;
    defraMentions: number | null;
    eaMentions: number | null;
    riparianMentions: number | null;
    publicMentions: number | null;
    consultationMentions: number | null;
  };
  quality: {
    clearObjectives: string;
    smartObjectives: string;
    monitoringEvaluation: string;
    referencesSFRAs: string;
    climateChangeScenarios: string;
    climateChangeRisk: string;
    surfaceWaterMeasures: string;
    adaptationPathways: string;
    defenceAssetRegister: string;
    populationChange: string;
    fcermAlignment: string;
  };
  termMentions: Record<string, number | string | null>;
  coastal: {
    smpMentions: number | null;
    slrMentions: number | null;
  };
}

export interface LLFAFeatureProperties {
  CTYUA24CD: string;
  CTYUA24NM: string;
  CTYUA24NMW: string;
  BNG_E: number;
  BNG_N: number;
  LONG: number;
  LAT: number;
  hasStrategy: boolean;
  strategy?: LLFAStrategyInfo;
  defenceCount: number | null;
  defenceCondition: number | null;
  totalSpend: number | null;
  homesProtected: number | null;
  propertiesHighRisk: number | null;
  propertiesHighRiskPct: number | null;
}

export interface LLFAGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: LLFAFeatureProperties;
  }>;
}

export function fetchLLFABoundaries(): Promise<LLFAGeoJSON> {
  return fetchJSON('/llfa');
}

export function fetchLLFAInfo(code: string): Promise<LLFAFeatureProperties> {
  return fetchJSON(`/llfa/${encodeURIComponent(code)}`);
}

// --- ONS IMD 2019 (Index of Multiple Deprivation) ---

export interface IMDFeatureProperties {
  lsoaCode: string;
  lsoaName: string;
  ladCode: string;
  ladName: string;
  imdScore: number;
  imdRank: number;
  imdDecile: number;
  incomeScore: number;
  incomeDecile: number;
  employmentScore: number;
  employmentDecile: number;
  educationScore: number;
  educationDecile: number;
  healthScore: number;
  healthDecile: number;
  crimeScore: number;
  crimeDecile: number;
  barriersScore: number;
  barriersDecile: number;
  livingEnvScore: number;
  livingEnvDecile: number;
  totalPop: number;
}

export interface IMDGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: IMDFeatureProperties;
  }>;
}

export function fetchIMDBoundaries(bbox: string): Promise<IMDGeoJSON> {
  return fetchJSON(`/imd?bbox=${encodeURIComponent(bbox)}`);
}

// --- WFD River Waterbody Catchments ---

export interface WFDCatchmentsGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: {
      wb_id: string;
      wb_name: string;
      rbd_id: string;
      rbd_name: string;
      wb_cat: string;
      area_km2: number;
      length_km: number;
    };
  }>;
}

export function fetchWFDCatchments(): Promise<WFDCatchmentsGeoJSON> {
  return fetchJSON('/datasets/waterbody-catchments');
}

// --- NFM Heat Maps / Hotspots ---

export interface NFMHotspotsGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: {
      layer: string;
    };
  }>;
}

export function fetchNFMHotspots(): Promise<NFMHotspotsGeoJSON> {
  return fetchJSON('/datasets/nfm-hotspots');
}

// --- State-Funded Schools ---

export interface SchoolsGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: {
      urn: string;
      name: string;
      type: string;
      phase: string;
      la: string;
      town: string;
      postcode: string;
      constituency: string;
    };
  }>;
}

export function fetchSchools(): Promise<SchoolsGeoJSON> {
  return fetchJSON('/datasets/schools');
}

// --- CQC Health / Care Locations ---

export interface HospitalsGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: {
      name: string;
      aka: string;
      address: string;
      postcode: string;
      phone: string;
      website: string;
      serviceTypes: string;
      specialisms: string;
      provider: string;
      la: string;
      region: string;
      cqcUrl: string;
    };
  }>;
}

export function fetchHospitals(): Promise<HospitalsGeoJSON> {
  return fetchJSON('/datasets/hospitals');
}

// --- EA Bathing Water Quality ---

export interface BathingWatersGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: {
      eubwid: string;
      name: string;
      samplePointId: string;
      district: string;
      county: string;
      country: string;
      classification: string;
      classificationYear: number;
      seasonStart: string;
      seasonEnd: string;
      pollutionRiskForecasting: boolean;
      sewerageUndertaker: string;
      bwqUrl: string;
    };
  }>;
}

export function fetchBathingWaters(): Promise<BathingWatersGeoJSON> {
  return fetchJSON('/datasets/bathing-waters');
}

// --- Ramsar Wetlands (England) ---

export interface RamsarGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: any };
    properties: {
      name: string;
      code: string;
      area_ha: number;
      status: string;
      gis_date: string;
    };
  }>;
}

export function fetchRamsar(): Promise<RamsarGeoJSON> {
  return fetchJSON('/datasets/ramsar');
}

// --- Water Company Boundaries ---

export interface WaterCompanyBoundariesGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: any };
    properties: {
      company: string;
      acronym: string;
      areaServed: string;
      coType: string;
      areaType: string;
    };
  }>;
}

export function fetchWaterCompanyBoundaries(): Promise<WaterCompanyBoundariesGeoJSON> {
  return fetchJSON('/datasets/water-company-boundaries');
}

// --- EDM Storm Overflows 2024 ---

export interface EDMOverflowsGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: {
      company: string;
      siteName: string;
      permitRef: string;
      assetType: string;
      receivingWater: string;
      totalDurationHrs: number;
      countedSpills: number;
      edmOperationPct: number;
      treatmentType: string;
      localAuthority: string;
      constituency: string;
      country: string;
      riverBasinDistrict: string;
    };
  }>;
}

export function fetchEDMOverflows(): Promise<EDMOverflowsGeoJSON> {
  return fetchJSON('/datasets/edm-overflows');
}

// --- WINEP Storm Overflows Under Investigation ---

export interface WINEPOverflowsGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: {
      company: string;
      siteName: string;
      waterBody: string;
      waterBodyId: string;
      waterBodyType: string;
      rbd: string;
      area: string;
      actionType: string;
      certainty: string;
      coreObligation: string;
      driverCode: string;
      winepId: string;
      uniqueId: string;
      implementationScope: string;
    };
  }>;
}

export function fetchWINEPOverflows(): Promise<WINEPOverflowsGeoJSON> {
  return fetchJSON('/datasets/winep-overflows');
}

// --- EDM Storm Overflow Annual Returns ---

export interface StormOverflowCompanySummary {
  company: string;
  shortName: string;
  totalOverflows: number;
  activeOverflows: number;
  edmCommissioned: number;
  overflowsWithSpillData: number;
  avgSpillsPerOverflow: number | null;
  avgDurationPerSpill: number | null;
  totalMonitoredSpills: number;
  totalSpillDurationHrs: number | null;
  pctSpilled10OrLess: number | null;
  pctSpilled60OrMore: number | null;
  pctEdmAbove90: number | null;
}

export interface StormOverflowSummary {
  year: number;
  companies: StormOverflowCompanySummary[];
  totals: {
    totalOverflows: number;
    activeOverflows: number;
    totalMonitoredSpills: number;
    avgSpillsPerOverflow: number | null;
    avgDurationPerSpill: number | null;
  };
}

export interface StormOverflowData {
  summary: StormOverflowSummary;
  recordCount: number;
}

export function fetchStormOverflows(): Promise<StormOverflowData> {
  return fetchJSON('/storm-overflows');
}

export function fetchStormOverflowSummary(): Promise<StormOverflowSummary> {
  return fetchJSON('/storm-overflows/summary');
}
