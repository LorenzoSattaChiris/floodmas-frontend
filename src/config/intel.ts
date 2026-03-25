// ─── FloodMAS — Intel Tab Data Model ─────────────────────────────────

// ── Data Sources ─────────────────────────────────────────────────────

export interface DataSource {
  id: number;
  name: string;
  type: 'api' | 'dataset' | 'tiles';
  auth: 'none' | 'api-key';
  provider: string;
  data: string;
  refresh: string;
  status: 'live' | 'static';
  healthKey?: string;          // key in HealthResponse.services (for live dot)
}

export const DATA_SOURCES: DataSource[] = [
  { id: 1,  name: 'EA Flood Monitoring API',   type: 'api',     auth: 'none',    provider: 'Environment Agency',    data: 'Flood warnings, station readings (level / rainfall / tidal / groundwater), flood areas',  refresh: '5 min',    status: 'live', healthKey: 'environmentAgency' },
  { id: 2,  name: 'Open-Meteo Forecast',       type: 'api',     auth: 'none',    provider: 'Open-Meteo',            data: 'Precipitation grid, soil moisture, snow depth, wind gusts, pressure',                      refresh: '30 min',   status: 'live' },
  { id: 3,  name: 'Open-Meteo Flood',          type: 'api',     auth: 'none',    provider: 'Open-Meteo',            data: '72 h river discharge forecast',                                                           refresh: '30 min',   status: 'live' },
  { id: 4,  name: 'Defra ArcGIS Online',       type: 'api',     auth: 'none',    provider: 'Defra',                 data: 'Flood defences, historic flood outlines, main rivers (FeatureServer)',                     refresh: '60 min',   status: 'live' },
  { id: 5,  name: 'EA WMS Tile Services',       type: 'tiles',   auth: 'none',    provider: 'Environment Agency',    data: '6 risk raster layers (rivers / sea, surface water, zones 2 / 3, reservoir dry / wet)',     refresh: '∞',        status: 'static' },
  { id: 6,  name: 'Bluesky AT Protocol',       type: 'api',     auth: 'none',    provider: 'Bluesky',               data: 'Public social flood posts',                                                               refresh: '2 min',    status: 'live', healthKey: 'bluesky' },
  { id: 7,  name: 'UKCEH NRFA',                type: 'api',     auth: 'none',    provider: 'UKCEH',                 data: 'National River Flow Archive gauging stations (~1 500+)',                                   refresh: '60 min',   status: 'live' },
  { id: 8,  name: 'Met Office DataHub',        type: 'api',     auth: 'api-key', provider: 'Met Office',             data: 'Hourly site-specific forecast (temperature, wind, rain probability, UV)',                  refresh: '30 min',   status: 'live' },
  { id: 9,  name: 'Copernicus CDS',            type: 'api',     auth: 'api-key', provider: 'Copernicus',             data: 'ERA5-Land reanalysis (temperature, precipitation, soil moisture, snow cover)',              refresh: '60 min',   status: 'live' },
  { id: 10, name: 'Ordnance Survey',           type: 'api',     auth: 'api-key', provider: 'OS',                     data: 'Place name search (Names API) + 3 ZXY tile basemaps (Light, Road, Outdoor)',              refresh: '∞',        status: 'live' },
  { id: 11, name: 'MapTiler',                  type: 'tiles',   auth: 'api-key', provider: 'MapTiler',               data: 'Hybrid satellite basemap tiles',                                                          refresh: '∞',        status: 'live' },
  { id: 12, name: 'Flood Risk Areas',          type: 'dataset', auth: 'none',    provider: 'Defra',                  data: '189 APSFR polygons (BNG → WGS 84)',                                                       refresh: '∞',        status: 'static' },
  { id: 13, name: 'Flood Management (NAO)',     type: 'dataset', auth: 'none',    provider: 'NAO / Defra',            data: 'Defence condition, spend, homes protected, properties at risk — 9 CSV files',             refresh: '∞',        status: 'static' },
  { id: 14, name: 'Flood Risk Zone (GOV.UK)',   type: 'dataset', auth: 'none',    provider: 'GOV.UK',                 data: 'Defence & property counts by UTLA / constituency — 2 CSV files',                          refresh: '∞',        status: 'static' },
  { id: 15, name: 'RoFRS Postcodes',           type: 'dataset', auth: 'none',    provider: 'EA / Defra',             data: 'Flood risk per postcode — 269 K postcodes',                                               refresh: '∞',        status: 'static' },
  { id: 16, name: 'RoFRS Properties',          type: 'dataset', auth: 'none',    provider: 'EA / Defra',             data: 'Property-level flood risk aggregation — 2.4 M rows',                                      refresh: '∞',        status: 'static' },
  { id: 17, name: 'LLFA Boundaries',           type: 'dataset', auth: 'none',    provider: 'Russell / Defra',        data: '218 county / UA boundaries + LFRMS audit — GeoJSON + XLSX',                               refresh: '∞',        status: 'static' },
  { id: 18, name: 'EDM Storm Overflows',       type: 'dataset', auth: 'none',    provider: 'Environment Agency',     data: '2024 annual return — 14 K+ storm overflows across 10 water companies (XLSX)',              refresh: '∞',        status: 'static' },
  { id: 19, name: 'WFD River Catchments',      type: 'dataset', auth: 'none',    provider: 'Defra',                  data: '4 092 WFD Cycle 2 river waterbody catchment polygons (BNG → WGS 84)',                      refresh: '∞',        status: 'static' },
  { id: 20, name: 'NFM Hotspots',              type: 'dataset', auth: 'none',    provider: 'Environment Agency',     data: '1 516 Natural Flood Management priority hotspot polygons (BNG → WGS 84)',                  refresh: '∞',        status: 'static' },
  { id: 21, name: 'Schools (State-Funded)',    type: 'dataset', auth: 'none',    provider: 'DfE / Edubase (GIAS)',   data: '~22 K open state-funded schools (postcode → WGS 84) — vulnerability infrastructure layer', refresh: '∞',        status: 'static' },
  { id: 22, name: 'Health & Care (CQC)',       type: 'dataset', auth: 'none',    provider: 'CQC',                    data: '~57 K CQC-regulated locations — hospitals, GPs, care homes, dentists (postcode → WGS 84)', refresh: '∞',        status: 'static' },
  { id: 23, name: 'Bathing Water Quality',     type: 'dataset', auth: 'none',    provider: 'Environment Agency',     data: '460 designated bathing waters with annual rBWD classification (Excellent / Good / Sufficient / Poor)', refresh: '∞', status: 'static' },
  { id: 24, name: 'Ramsar Wetlands (England)', type: 'dataset', auth: 'none',    provider: 'Natural England / Defra', data: '73 Ramsar Convention wetlands of international importance — 1 291 polygons (WGS 84)', refresh: '∞', status: 'static' },
  { id: 25, name: 'Water Company Boundaries', type: 'dataset', auth: 'none',    provider: 'Ofwat / Stream',         data: '432 Ofwat water company service area boundary polygons — 27 companies (WGS 84)', refresh: '∞', status: 'static' },
  { id: 26, name: 'EDM Storm Overflows 2024', type: 'dataset', auth: 'none',    provider: 'EA / Rivers Trust / CaBA', data: '16 625 monitored storm overflow discharge points — spill counts & duration from 11 water companies (WGS 84)', refresh: '∞', status: 'static' },
  { id: 27, name: 'WINEP Overflows Under Investigation', type: 'dataset', auth: 'none', provider: 'EA / Rivers Trust / CaBA', data: '4 320 WINEP intermittent discharge sites under investigation from 10 water companies (WGS 84)', refresh: '∞', status: 'static' },
];

// ── Agents ───────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  role: 'supervisor' | 'worker';
  model: string;
  color: string;
  description: string;
  toolIds: string[];
}

export const AGENTS: Agent[] = [
  {
    id: 'coordinator',
    name: 'Coordinator',
    role: 'supervisor',
    model: 'GPT-5.4',
    color: '#0ea5e9',
    description: 'Central orchestrator — receives user queries, delegates to specialist departments, and synthesises a unified briefing.',
    toolIds: [],
  },
  {
    id: 'forecasting',
    name: 'Forecasting',
    role: 'worker',
    model: 'GPT-5.4-mini',
    color: '#14b8a6',
    description: 'Weather prediction, LSTM-PINN river-level forecasting, rainfall accumulation, and soil saturation analysis.',
    toolIds: ['get_weather_forecast', 'get_river_levels', 'forecast_flood_levels', 'get_precipitation_data', 'get_river_discharge_data', 'get_soil_moisture_data', 'query_atmospheric_models'],
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    role: 'worker',
    model: 'GPT-5.4-mini',
    color: '#a855f6',
    description: 'Real-time IoT sensor readings, threshold breach detection, station health monitoring, and live EA flood warnings.',
    toolIds: ['read_sensor_network', 'detect_sensor_anomalies', 'query_live_flood_warnings', 'query_ea_stations', 'query_nrfa_stations'],
  },
  {
    id: 'riskAnalysis',
    name: 'Risk Analysis',
    role: 'worker',
    model: 'GPT-5.4-mini',
    color: '#f97316',
    description: 'EA flood-zone classification, infrastructure risk matrices, population-impact estimation, and GBT ensemble risk scoring.',
    toolIds: ['get_flood_zone_info', 'assess_infrastructure_vulnerability', 'estimate_population_at_risk', 'predict_flood_risk', 'query_flood_warning_areas', 'query_flood_risk_areas', 'query_llfa', 'query_imd_deprivation', 'query_wfd_catchments', 'query_nfm_hotspots', 'query_storm_overflows', 'query_schools', 'query_hospitals', 'query_bathing_waters', 'query_ramsar', 'query_water_company_boundaries', 'query_edm_overflows', 'query_winep_overflows'],
  },
  {
    id: 'emergencyResponse',
    name: 'Emergency Response',
    role: 'worker',
    model: 'GPT-5.4-mini',
    color: '#ef4444',
    description: 'EA-standard alert generation, evacuation planning, resource deployment, and Gold / Silver / Bronze command activation.',
    toolIds: ['generate_flood_alert', 'plan_evacuation', 'allocate_resources', 'escalate_emergency', 'query_flood_defences', 'query_historic_floods', 'query_main_rivers'],
  },
];

// ── Tools ────────────────────────────────────────────────────────────

export interface Tool {
  id: string;
  name: string;
  category: 'weather' | 'sensor' | 'risk' | 'emergency' | 'map-layer';
  specialist: string;
  description: string;
  mlModel?: boolean;
}

export const TOOLS: Tool[] = [
  // Forecasting (7)
  { id: 'get_weather_forecast',    name: 'Weather Forecast',       category: 'weather',    specialist: 'Forecasting', description: 'Multi-day rainfall, wind, temperature, flood risk classification' },
  { id: 'get_river_levels',       name: 'River Levels',            category: 'weather',    specialist: 'Forecasting', description: 'Current / predicted 24 h / 48 h levels, flood threshold %, trend' },
  { id: 'forecast_flood_levels',  name: 'Flood Level Forecast',    category: 'weather',    specialist: 'Forecasting', description: 'LSTM-PINN physics-informed 15-min timestep predictions with confidence intervals', mlModel: true },
  { id: 'get_precipitation_data', name: 'Precipitation Data',      category: 'weather',    specialist: 'Forecasting', description: 'Open-Meteo grid: current rain, 3 h / 6 h accumulation, wind, temperature' },
  { id: 'get_river_discharge_data', name: 'River Discharge',       category: 'weather',    specialist: 'Forecasting', description: 'Open-Meteo Flood API: current / peak m³/s for 24 h / 72 h horizon' },
  { id: 'get_soil_moisture_data', name: 'Soil Moisture',           category: 'weather',    specialist: 'Forecasting', description: 'Soil saturation levels (saturated / very wet / wet / moderate / dry)' },
  { id: 'query_atmospheric_models', name: 'Atmospheric Models',    category: 'weather',    specialist: 'Forecasting', description: 'UK 2 km deterministic, Global 10 km, MOGREPS ensemble availability' },

  // Monitoring (5)
  { id: 'read_sensor_network',       name: 'Sensor Network',       category: 'sensor',     specialist: 'Monitoring', description: 'IoT snapshot: river level, rainfall, soil moisture, flow rate, groundwater' },
  { id: 'detect_sensor_anomalies',   name: 'Sensor Anomalies',     category: 'sensor',     specialist: 'Monitoring', description: 'Threshold breaches with severity, anomaly type, rate of change' },
  { id: 'query_live_flood_warnings', name: 'Live Flood Warnings',  category: 'sensor',     specialist: 'Monitoring', description: 'Active EA warnings with severity counts, affected rivers' },
  { id: 'query_ea_stations',         name: 'EA Stations',          category: 'map-layer',  specialist: 'Monitoring', description: 'Nearby EA monitoring stations with type, status, river, catchment' },
  { id: 'query_nrfa_stations',       name: 'NRFA Stations',        category: 'map-layer',  specialist: 'Monitoring', description: 'NRFA river gauging stations with catchment area and flow archive' },

  // Risk Analysis (8)
  { id: 'get_flood_zone_info',                name: 'Flood Zone Info',              category: 'risk',      specialist: 'Risk Analysis', description: 'EA flood zone (1 / 2 / 3a / 3b), historical floods, defences, drainage' },
  { id: 'assess_infrastructure_vulnerability',name: 'Infrastructure Vulnerability', category: 'risk',      specialist: 'Risk Analysis', description: 'Critical assets (hospitals, power, transport) with risk levels' },
  { id: 'estimate_population_at_risk',        name: 'Population at Risk',           category: 'risk',      specialist: 'Risk Analysis', description: 'Affected population, displaced persons, vulnerable groups, shelters' },
  { id: 'predict_flood_risk',                 name: 'Flood Risk Prediction',        category: 'risk',      specialist: 'Risk Analysis', description: 'GBT ensemble: overall, property, infrastructure, life, economic scores', mlModel: true },
  { id: 'query_flood_warning_areas',          name: 'Flood Warning Areas',          category: 'map-layer', specialist: 'Risk Analysis', description: 'EA official warning / alert boundaries with river names' },
  { id: 'query_flood_risk_areas',             name: 'Flood Risk Areas',             category: 'map-layer', specialist: 'Risk Analysis', description: 'Defra APSFR — areas of potentially significant flood risk' },
  { id: 'query_llfa',                         name: 'LLFA Boundaries',              category: 'map-layer', specialist: 'Risk Analysis', description: 'Lead Local Flood Authority boundaries + LFRMS audit scores' },
  { id: 'query_imd_deprivation',              name: 'IMD Deprivation',              category: 'map-layer', specialist: 'Risk Analysis', description: 'IMD 2019 decile distribution and flood + deprivation vulnerability' },
  { id: 'query_wfd_catchments',               name: 'WFD Catchments',               category: 'map-layer', specialist: 'Risk Analysis', description: 'WFD Cycle 2 river waterbody catchment boundaries with area and length' },
  { id: 'query_nfm_hotspots',                 name: 'NFM Hotspots',                 category: 'map-layer', specialist: 'Risk Analysis', description: 'EA Natural Flood Management priority hotspot areas' },
  { id: 'query_storm_overflows',              name: 'Storm Overflows',              category: 'risk',      specialist: 'Risk Analysis', description: 'EDM 2024 storm overflow spill statistics per water company' },
  { id: 'query_schools',                      name: 'Schools (State-Funded)',        category: 'map-layer', specialist: 'Risk Analysis', description: '~22K state-funded schools — flood vulnerability infrastructure layer' },
  { id: 'query_hospitals',                     name: 'Health & Care (CQC)',           category: 'map-layer', specialist: 'Risk Analysis', description: '~57K CQC-regulated health/care locations — hospitals, GPs, care homes, dentists' },
  { id: 'query_bathing_waters',                name: 'Bathing Water Quality',         category: 'map-layer', specialist: 'Risk Analysis', description: '460 EA designated bathing waters with annual rBWD water quality classification' },
  { id: 'query_ramsar',                        name: 'Ramsar Wetlands',               category: 'map-layer', specialist: 'Risk Analysis', description: '73 Ramsar Convention wetlands of international importance (England) — 1 291 polygons' },
  { id: 'query_water_company_boundaries',      name: 'Water Company Boundaries',      category: 'map-layer', specialist: 'Risk Analysis', description: '432 Ofwat water company service area boundary polygons — 27 companies' },
  { id: 'query_edm_overflows',                 name: 'EDM Storm Overflows 2024',      category: 'map-layer', specialist: 'Risk Analysis', description: '16 625 monitored storm overflow discharge points with spill counts & duration' },
  { id: 'query_winep_overflows',               name: 'WINEP Overflows Under Investigation', category: 'map-layer', specialist: 'Risk Analysis', description: '4 320 WINEP intermittent discharge sites under investigation from 10 water companies' },

  // Emergency Response (7)
  { id: 'generate_flood_alert',   name: 'Flood Alert Generator',   category: 'emergency',  specialist: 'Emergency Response', description: 'EA-standard alerts (Flood Watch → Severe Flood Warning)' },
  { id: 'plan_evacuation',        name: 'Evacuation Planner',      category: 'emergency',  specialist: 'Emergency Response', description: 'Zones, routes (primary / secondary / emergency), shelter capacities' },
  { id: 'allocate_resources',     name: 'Resource Allocation',     category: 'emergency',  specialist: 'Emergency Response', description: 'Personnel, equipment, logistics, cost estimates, mutual aid' },
  { id: 'escalate_emergency',     name: 'Emergency Escalation',    category: 'emergency',  specialist: 'Emergency Response', description: 'Gold / Silver / Bronze command, MACA / COBR activation' },
  { id: 'query_flood_defences',   name: 'Flood Defences',          category: 'map-layer',  specialist: 'Emergency Response', description: 'Defence features: walls, embankments, barriers — type, condition, age' },
  { id: 'query_historic_floods',  name: 'Historic Floods',         category: 'map-layer',  specialist: 'Emergency Response', description: 'EA recorded flood outlines with dates, causes, peak levels' },
  { id: 'query_main_rivers',      name: 'Main Rivers',             category: 'map-layer',  specialist: 'Emergency Response', description: 'EA statutory main rivers with segment counts' },
];

// ── ML Models ────────────────────────────────────────────────────────

export interface MLModel {
  id: string;
  name: string;
  badge: string;
  architecture: string;
  description: string;
  inputFeatures: string[];
  outputs: string[];
  loss: string;
}

export const ML_MODELS: MLModel[] = [
  {
    id: 'lstm-pinn',
    name: 'Flood Level Forecast',
    badge: 'LSTM-PINN',
    architecture: 'LSTM(64) → Dropout(0.2) → LSTM(32) → Dropout(0.2) → Dense(16, ReLU) → Dense(1)',
    description: 'Physics-informed neural network with mass-conservation proxy loss. Predicts next water level at 15-min timesteps with confidence intervals.',
    inputFeatures: ['water_level (m)', 'rainfall (mm)', 'discharge (m³/s)', 'hour_sin', 'hour_cos'],
    outputs: ['Water level prediction (m)'],
    loss: 'MSE + λ × PhysicsLoss (λ = 0.1)',
  },
  {
    id: 'gbt-risk',
    name: 'Flood Risk Scorer',
    badge: 'GBT Ensemble',
    architecture: 'Dense(128, ReLU) → Dropout(0.3) → Dense(64, ReLU) → Dropout(0.2) → Dense(32, ReLU) → Dense(5, Sigmoid)',
    description: 'Gradient Boosted Tree-inspired dense network. Scores 5 risk dimensions from 15 engineered hydro-meteorological features.',
    inputFeatures: [
      'water_level_pct', 'water_level_trend', 'rainfall_current', 'rainfall_3h', 'rainfall_6h',
      'river_discharge', 'soil_moisture', 'flood_zone_class', 'defence_condition', 'defence_age',
      'historical_flood_freq', 'population', 'drainage_capacity', 'season_sin', 'upstream_discharge_delta',
    ],
    outputs: ['overall', 'property', 'infrastructure', 'life', 'economic'],
    loss: 'MSE (Adam lr = 0.001)',
  },
];

// ── Graph Layout Helpers ─────────────────────────────────────────────

export const SPECIALIST_IDS = AGENTS.filter((a) => a.role === 'worker').map((a) => a.id);
