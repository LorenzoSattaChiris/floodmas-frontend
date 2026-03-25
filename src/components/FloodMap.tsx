import { useRef, useEffect, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MAP_STYLE, MAP_INITIAL_VIEW, OS_TILE_LAYERS } from '../config/layers';
import { useLayerStore } from '../stores/layerStore';
import { useMapRef } from '../context/MapContext';
import {
  useFloodWarnings,
  useWaterLevelStations,
  useRainfallStations,
  useLatestReadings,
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
  useIMDBoundaries,
  useRiskLayerFeatures,
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
import type {
  FloodWarning,
  Station,
  Reading,
  PrecipitationPoint,
  RiverDischargePoint,
  SoilMoisturePoint,
  NRFAStation,
  FloodArea,
  ExtendedWeatherPoint,
  MetOfficeForecastPoint,
  CDSReanalysisPoint,
} from '../services/api';

// ─── Severity Palette ────────────────────────────────────────────────
function severityColor(level: number): string {
  switch (level) {
    case 1: return '#ef4444'; // Severe — bright red
    case 2: return '#f97316'; // Warning — orange
    case 3: return '#eab308'; // Alert — yellow
    default: return '#94a3b8';
  }
}
function severityLabel(level: number): string {
  switch (level) {
    case 1: return 'Severe Flood Warning';
    case 2: return 'Flood Warning';
    case 3: return 'Flood Alert';
    case 4: return 'Warning No Longer In Force';
    default: return 'Unknown';
  }
}

// ─── Station Status Colors ───────────────────────────────────────────
function stationStatusColor(
  reading: number | undefined,
  typicalHigh: number | undefined,
  typicalLow: number | undefined,
  maxOnRecord: number | undefined,
): string {
  if (reading === undefined || typicalHigh === undefined) return '#0ea5e9';
  if (maxOnRecord !== undefined && reading >= maxOnRecord * 0.9) return '#ef4444';
  const range = (typicalHigh - (typicalLow ?? 0)) || 1;
  if (reading > typicalHigh + range * 0.5) return '#ef4444';
  if (reading > typicalHigh) return '#eab308';
  return '#22c55e';
}

function stationStatusLabel(color: string): string {
  switch (color) {
    case '#ef4444': return 'High';
    case '#eab308': return 'Elevated';
    case '#22c55e': return 'Normal';
    default: return 'No data';
  }
}

// ─── River Discharge Colors ────────────────────────────────────────
function dischargeColor(m3s: number): string {
  if (m3s >= 500) return '#ef4444'; // Very high
  if (m3s >= 200) return '#f97316'; // High
  if (m3s >= 50)  return '#eab308'; // Moderate
  if (m3s >= 10)  return '#14b8a6'; // Low-moderate
  return '#67e8f9';                  // Low
}
function dischargeRadius(m3s: number): number {
  if (m3s >= 500) return 16;
  if (m3s >= 200) return 12;
  if (m3s >= 50)  return 9;
  if (m3s >= 10)  return 7;
  return 5;
}

// ─── Precipitation Colors ────────────────────────────────────────────
function precipColor(mm: number): string {
  if (mm >= 8) return '#7c3aed';
  if (mm >= 4) return '#ef4444';
  if (mm >= 2) return '#f97316';
  if (mm >= 0.5) return '#3b82f6';
  if (mm > 0) return '#93c5fd';
  return '#e2e8f0';
}
function precipRadius(mm: number): number {
  if (mm >= 8) return 22;
  if (mm >= 4) return 18;
  if (mm >= 2) return 14;
  if (mm >= 0.5) return 10;
  if (mm > 0) return 7;
  return 5;
}

// ─── Soil Moisture Colors ────────────────────────────────────────────
function soilMoistureColor(m3m3: number): string {
  if (m3m3 >= 0.4)  return '#7c2d12'; // Saturated — dark brown
  if (m3m3 >= 0.3)  return '#a16207'; // Very wet — amber-brown
  if (m3m3 >= 0.2)  return '#ca8a04'; // Moist — yellow-brown
  if (m3m3 >= 0.1)  return '#65a30d'; // Normal — green
  return '#86efac';                     // Dry — light green
}
function soilMoistureRadius(m3m3: number): number {
  if (m3m3 >= 0.4) return 18;
  if (m3m3 >= 0.3) return 14;
  if (m3m3 >= 0.2) return 11;
  if (m3m3 >= 0.1) return 8;
  return 6;
}

// ─── Wind Gust Colors (Extended Weather) ─────────────────────────────
function windGustColor(kmh: number): string {
  if (kmh >= 100) return '#ef4444'; // Storm
  if (kmh >= 70)  return '#f97316'; // Gale
  if (kmh >= 40)  return '#eab308'; // Strong
  if (kmh >= 20)  return '#60a5fa'; // Moderate
  return '#93c5fd';                  // Light
}
function windGustRadius(kmh: number): number {
  if (kmh >= 100) return 18;
  if (kmh >= 70)  return 14;
  if (kmh >= 40)  return 11;
  if (kmh >= 20)  return 8;
  return 6;
}

// ─── Met Office Color ────────────────────────────────────────────────
function metOfficeColor(precipRate: number, precipProb: number): string {
  if (precipRate >= 4)  return '#7c3aed'; // Heavy rain — purple
  if (precipRate >= 2)  return '#ef4444'; // Moderate-heavy — red
  if (precipRate >= 0.5) return '#f97316'; // Moderate — orange
  if (precipProb >= 60) return '#eab308'; // High prob — yellow
  return '#f59e0b';                       // Default amber
}

function cdsReanalysisColor(soilMoisture: number, precip: number): string {
  if (precip >= 2)         return '#3b82f6'; // Heavy precip — blue
  if (precip >= 0.5)       return '#60a5fa'; // Moderate precip — light blue
  if (soilMoisture >= 0.4) return '#92400e'; // Very wet soil — dark brown
  if (soilMoisture >= 0.3) return '#a16207'; // Wet soil — amber-brown
  return '#7c3aed';                          // Default — purple
}

// ─── LLFA Choropleth Paint Definitions ───────────────────────────────
function getLLFAChoroplethPaint(mode: string) {
  if (mode === 'none') {
    return {
      fillColor: ['case', ['get', 'hasStrategy'], '#10b981', '#64748b'] as any,
      fillOpacity: 0.12,
      lineColor: ['case', ['get', 'hasStrategy'], '#10b981', '#64748b'] as any,
      lineOpacity: 0.7,
    };
  }

  const ramps: Record<string, { prop: string; stops: (number | string)[] }> = {
    defences: {
      prop: 'defenceCount',
      stops: ['#1e293b', 1, '#86efac', 50, '#22c55e', 150, '#16a34a', 300, '#15803d', 500, '#14532d'],
    },
    spend: {
      prop: 'totalSpend',
      stops: ['#1e293b', 1, '#bfdbfe', 100000, '#60a5fa', 1000000, '#3b82f6', 5000000, '#1d4ed8', 10000000, '#1e3a5f'],
    },
    risk: {
      prop: 'propertiesHighRisk',
      stops: ['#dcfce7', 100, '#fef08a', 500, '#fbbf24', 2000, '#f97316', 5000, '#ef4444', 10000, '#991b1b'],
    },
    protected: {
      prop: 'homesProtected',
      stops: ['#1e293b', 1, '#d9f99d', 50, '#84cc16', 200, '#65a30d', 500, '#4d7c0f'],
    },
  };

  const r = ramps[mode];
  if (!r) return getLLFAChoroplethPaint('none');

  return {
    fillColor: [
      'case', ['==', ['get', r.prop], null], '#374151',
      ['step', ['coalesce', ['get', r.prop], 0], ...r.stops],
    ] as any,
    fillOpacity: 0.45,
    lineColor: '#ffffff' as any,
    lineOpacity: 0.25,
  };
}

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `£${Math.round(v / 1_000)}K`;
  return `£${v}`;
}

// ─── Component ───────────────────────────────────────────────────────
export default function FloodMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useMapRef();
  const [mapLoaded, setMapLoaded] = useState(false);
  const visibleLayers = useLayerStore((s) => s.visibleLayers);
  const llfaChoropleth = useLayerStore((s) => s.llfaChoropleth);

  const { data: floods } = useFloodWarnings();
  const { data: levelStations } = useWaterLevelStations();
  const { data: rainStations } = useRainfallStations(visibleLayers.has('rainfall-stations'));
  const { data: latestReadings } = useLatestReadings();
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
  const { data: historicFloods } = useHistoricFloods(visibleLayers.has('historic-floods'));
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

  const setMapZoom = useLayerStore((s) => s.setMapZoom);
  const [mapBbox, setMapBbox] = useState<string | null>(null);
  const [riskBbox, setRiskBbox] = useState<string | null>(null);
  const imdLayerVisible = visibleLayers.has('imd-deprivation');
  const { data: imdData } = useIMDBoundaries(imdLayerVisible ? mapBbox : null);

  // Risk polygon layers — bbox-gated at zoom >= 8
  const { data: riskRiversSeaData } = useRiskLayerFeatures('risk-rivers-sea', riskBbox, visibleLayers.has('risk-rivers-sea'));
  const { data: riskSurfaceWaterData } = useRiskLayerFeatures('risk-surface-water', riskBbox, visibleLayers.has('risk-surface-water'));
  const { data: floodZone2Data } = useRiskLayerFeatures('flood-zone-2', riskBbox, visibleLayers.has('flood-zone-2'));
  const { data: floodZone3Data } = useRiskLayerFeatures('flood-zone-3', riskBbox, visibleLayers.has('flood-zone-3'));
  const { data: reservoirDryData } = useRiskLayerFeatures('reservoir-dry', riskBbox, visibleLayers.has('reservoir-dry'));
  const { data: reservoirWetData } = useRiskLayerFeatures('reservoir-wet', riskBbox, visibleLayers.has('reservoir-wet'));


  // ─── Initialize map ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: MAP_INITIAL_VIEW.center,
      zoom: MAP_INITIAL_VIEW.zoom,
      maxBounds: [[-12, 49], [4, 62]],
    });
    map.addControl(new maplibregl.FullscreenControl(), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 150, unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      // ── Layer Order (bottom → top): ──
      // 1. WMS risk rasters        (reference / risk)
      // 2. Historic flood outlines  (reference)
      // 3. Flood defences           (reference)
      // 4. Precipitation grid       (weather)
      // 5. River discharge          (weather)
      // 6. Rainfall stations        (live)
      // 7. Water level stations     (live)
      // 8. Flood warnings           (live — highest priority)

      // ─ 0. OS Map Tile Layers (reference base maps, lowest in stack) ─
      addOSTileLayer(map, 'os-map-light', OS_TILE_LAYERS.light);
      addOSTileLayer(map, 'os-map-road', OS_TILE_LAYERS.road);
      addOSTileLayer(map, 'os-map-outdoor', OS_TILE_LAYERS.outdoor);

      // ─ 1. Risk Polygon Layers (GeoJSON from FeatureServer) ─
      addRiskPolygonLayer(map, 'risk-rivers-sea', '#7c3aed');
      addRiskPolygonLayer(map, 'risk-surface-water', '#06b6d4');
      addRiskPolygonLayer(map, 'flood-zone-2', '#818cf8');
      addRiskPolygonLayer(map, 'flood-zone-3', '#c084fc');
      addRiskPolygonLayer(map, 'reservoir-dry', '#f472b6');
      addRiskPolygonLayer(map, 'reservoir-wet', '#fb7185');

      // ─ 1a. Flood Warning Areas (polygons) ─
      map.addSource('flood-warning-areas', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'flood-warning-areas-fill',
        type: 'fill',
        source: 'flood-warning-areas',
        paint: { 'fill-color': '#fbbf24', 'fill-opacity': 0.12 },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'flood-warning-areas-outline',
        type: 'line',
        source: 'flood-warning-areas',
        paint: { 'line-color': '#fbbf24', 'line-width': 1.5, 'line-opacity': 0.6 },
        layout: { visibility: 'none' },
      });

      // ─ 1aa. Flood Risk Areas (Defra APSFR polygons) ─
      map.addSource('flood-risk-areas', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'flood-risk-areas-fill',
        type: 'fill',
        source: 'flood-risk-areas',
        paint: { 'fill-color': '#e879f9', 'fill-opacity': 0.15 },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'flood-risk-areas-outline',
        type: 'line',
        source: 'flood-risk-areas',
        paint: { 'line-color': '#e879f9', 'line-width': 1.5, 'line-opacity': 0.65 },
        layout: { visibility: 'none' },
      });

      // ─ 1ab. LLFA Boundaries (County/Unitary Authority boundaries) ─
      map.addSource('llfa-boundaries', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'llfa-boundaries-fill',
        type: 'fill',
        source: 'llfa-boundaries',
        paint: {
          'fill-color': ['case', ['get', 'hasStrategy'], '#10b981', '#64748b'],
          'fill-opacity': 0.12,
        },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'llfa-boundaries-outline',
        type: 'line',
        source: 'llfa-boundaries',
        paint: {
          'line-color': ['case', ['get', 'hasStrategy'], '#10b981', '#64748b'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 10, 2],
          'line-opacity': 0.7,
        },
        layout: { visibility: 'none' },
      });

      // ─ 1ac. IMD Deprivation (LSOA choropleth) ─
      map.addSource('imd-deprivation', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'imd-deprivation-fill',
        type: 'fill',
        source: 'imd-deprivation',
        paint: {
          'fill-color': ['match', ['get', 'imdDecile'],
            1, '#7f1d1d', 2, '#991b1b', 3, '#b91c1c', 4, '#dc2626', 5, '#ea580c',
            6, '#ca8a04', 7, '#65a30d', 8, '#16a34a', 9, '#15803d', 10, '#166534',
            '#374151'],
          'fill-opacity': 0.65,
        },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'imd-deprivation-outline',
        type: 'line',
        source: 'imd-deprivation',
        paint: {
          'line-color': ['match', ['get', 'imdDecile'],
            1, '#7f1d1d', 2, '#991b1b', 3, '#b91c1c', 4, '#dc2626', 5, '#ea580c',
            6, '#ca8a04', 7, '#65a30d', 8, '#16a34a', 9, '#15803d', 10, '#166534',
            '#374151'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.3, 12, 1],
          'line-opacity': 0.5,
        },
        layout: { visibility: 'none' },
      });

      // ─ 1ad. WFD River Waterbody Catchments ─
      map.addSource('wfd-catchments', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'wfd-catchments-fill',
        type: 'fill',
        source: 'wfd-catchments',
        paint: { 'fill-color': '#0891b2', 'fill-opacity': 0.1 },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'wfd-catchments-outline',
        type: 'line',
        source: 'wfd-catchments',
        paint: {
          'line-color': '#0891b2',
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 1.5],
          'line-opacity': 0.6,
        },
        layout: { visibility: 'none' },
      });

      // ─ 1ae. NFM Hotspots ─
      map.addSource('nfm-hotspots', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'nfm-hotspots-fill',
        type: 'fill',
        source: 'nfm-hotspots',
        paint: { 'fill-color': '#84cc16', 'fill-opacity': 0.18 },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'nfm-hotspots-outline',
        type: 'line',
        source: 'nfm-hotspots',
        paint: {
          'line-color': '#84cc16',
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 1.5],
          'line-opacity': 0.6,
        },
        layout: { visibility: 'none' },
      });

      // ─ 1af. Schools (point layer) ─
      map.addSource('schools', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'schools-circles',
        type: 'circle',
        source: 'schools',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 10, 5, 14, 8],
          'circle-color': '#f59e0b',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 1ag. Hospitals / CQC locations (point layer) ─
      map.addSource('hospitals', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'hospitals-circles',
        type: 'circle',
        source: 'hospitals',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 10, 5, 14, 8],
          'circle-color': '#ec4899',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 1ah. Bathing Water Quality (point layer, colour-coded by classification) ─
      map.addSource('bathing-waters', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'bathing-waters-circles',
        type: 'circle',
        source: 'bathing-waters',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 4, 10, 7, 14, 12],
          'circle-color': [
            'match', ['get', 'classification'],
            'Excellent', '#3b82f6',
            'Good', '#22c55e',
            'Sufficient', '#eab308',
            'Poor', '#ef4444',
            '#94a3b8',
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.7)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 1ai. Ramsar Wetlands (polygon layer) ─
      map.addSource('ramsar-wetlands', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'ramsar-wetlands-fill',
        type: 'fill',
        source: 'ramsar-wetlands',
        paint: { 'fill-color': '#059669', 'fill-opacity': 0.18 },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'ramsar-wetlands-outline',
        type: 'line',
        source: 'ramsar-wetlands',
        paint: {
          'line-color': '#059669',
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 1.5],
          'line-opacity': 0.6,
        },
        layout: { visibility: 'none' },
      });

      // ─ 1aj. Water Company Boundaries (polygon layer) ─
      map.addSource('water-company-boundaries', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'water-company-boundaries-fill',
        type: 'fill',
        source: 'water-company-boundaries',
        paint: { 'fill-color': '#7c3aed', 'fill-opacity': 0.12 },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'water-company-boundaries-outline',
        type: 'line',
        source: 'water-company-boundaries',
        paint: {
          'line-color': '#7c3aed',
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 10, 2],
          'line-opacity': 0.7,
        },
        layout: { visibility: 'none' },
      });

      // ─ 1ak. EDM Storm Overflows 2024 (point layer, colour-coded by spill count) ─
      map.addSource('edm-overflows', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'edm-overflows-circles',
        type: 'circle',
        source: 'edm-overflows',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 10, 5, 14, 9],
          'circle-color': ['interpolate', ['linear'], ['get', 'countedSpills'],
            0, '#22c55e',
            10, '#eab308',
            40, '#f97316',
            100, '#ef4444',
            200, '#991b1b'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 1al. WINEP Storm Overflows Under Investigation (point layer, colour-coded by action type) ─
      map.addSource('winep-overflows', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'winep-overflows-circles',
        type: 'circle',
        source: 'winep-overflows',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 10, 5, 14, 9],
          'circle-color': ['match', ['get', 'actionType'],
            'INV', '#eab308',
            'MON', '#3b82f6',
            'IMP', '#22c55e',
            'ND', '#a855f7',
            '#9ca3af'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 1b. Main Rivers ─
      map.addSource('main-rivers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'main-rivers-line',
        type: 'line',
        source: 'main-rivers',
        paint: {
          'line-color': '#2563eb',
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.8, 12, 2.5],
          'line-opacity': 0.7,
        },
        layout: { visibility: 'none' },
      });

      // ─ 2. Historic Flood Outlines ─
      map.addSource('historic-floods', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'historic-floods-fill',
        type: 'fill',
        source: 'historic-floods',
        paint: { 'fill-color': '#f97316', 'fill-opacity': 0.15 },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'historic-floods-outline',
        type: 'line',
        source: 'historic-floods',
        paint: { 'line-color': '#f97316', 'line-width': 1.5, 'line-opacity': 0.6 },
        layout: { visibility: 'none' },
      });

      // ─ 3. Flood Defences ─
      map.addSource('flood-defences', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'flood-defences-line',
        type: 'line',
        source: 'flood-defences',
        paint: {
          'line-color': '#22c55e',
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.5, 14, 4],
          'line-opacity': 0.8,
        },
        layout: { visibility: 'none' },
      });
      map.addLayer({
        id: 'flood-defences-fill',
        type: 'fill',
        source: 'flood-defences',
        paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.1 },
        layout: { visibility: 'none' },
      });

      // ─ 4. Precipitation Grid ─
      map.addSource('precipitation', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'precipitation-halo',
        type: 'circle',
        source: 'precipitation',
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.12,
          'circle-blur': 1,
        },
      });
      map.addLayer({
        id: 'precipitation-circles',
        type: 'circle',
        source: 'precipitation',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, ['*', ['get', 'radius'], 0.5],
            10, ['get', 'radius'],
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.7,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.3)',
        },
      });

      // ─ 5. River Discharge ─
      map.addSource('river-discharge', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'river-discharge-circles',
        type: 'circle',
        source: 'river-discharge',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, ['*', ['get', 'radius'], 0.7],
            10, ['get', 'radius'],
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.8,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.4)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 5b. Soil Moisture ─
      map.addSource('soil-moisture', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'soil-moisture-circles',
        type: 'circle',
        source: 'soil-moisture',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, ['*', ['get', 'radius'], 0.6],
            10, ['get', 'radius'],
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.7,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.35)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 6. Rainfall Stations ─
      map.addSource('rainfall-stations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'rainfall-stations-circles',
        type: 'circle',
        source: 'rainfall-stations',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 10, 7],
          'circle-color': '#8b5cf6',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
      });

      // ─ 6b. Tidal Stations ─
      map.addSource('tidal-stations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'tidal-stations-circles',
        type: 'circle',
        source: 'tidal-stations',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3.5, 10, 8],
          'circle-color': '#06b6d4',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 6c. Groundwater Stations ─
      map.addSource('groundwater-stations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'groundwater-stations-circles',
        type: 'circle',
        source: 'groundwater-stations',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 10, 7],
          'circle-color': '#0d9488',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 6d. NRFA Gauging Stations ─
      map.addSource('nrfa-stations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'nrfa-stations-circles',
        type: 'circle',
        source: 'nrfa-stations',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 10, 7],
          'circle-color': '#e11d48',
          'circle-opacity': 0.8,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 5c. Extended Weather (Snow & Wind Gusts) ─
      map.addSource('extended-weather', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'extended-weather-circles',
        type: 'circle',
        source: 'extended-weather',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, ['*', ['get', 'radius'], 0.6],
            10, ['get', 'radius'],
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.7,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.4)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 5d. Met Office Forecast ─
      map.addSource('met-office-forecast', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'met-office-forecast-circles',
        type: 'circle',
        source: 'met-office-forecast',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, 6,
            10, 13,
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.6)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 5e. CDS ERA5-Land Reanalysis ─
      map.addSource('cds-reanalysis', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'cds-reanalysis-circles',
        type: 'circle',
        source: 'cds-reanalysis',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, 7,
            10, 14,
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.6)',
        },
        layout: { visibility: 'none' },
      });

      // ─ 7. Water Level Stations (color-coded by reading status) ─
      map.addSource('water-level-stations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'water-level-stations-circles',
        type: 'circle',
        source: 'water-level-stations',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 4, 10, 9],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.9,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.6)',
        },
      });

      // ─ 8. Flood Warnings (highest visual priority) ─
      map.addSource('flood-warnings', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'flood-warnings-pulse',
        type: 'circle',
        source: 'flood-warnings',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 16, 10, 32],
          'circle-color': ['get', 'color'],
          'circle-opacity': ['interpolate', ['linear'], ['get', 'severityLevel'], 1, 0.25, 3, 0.08],
        },
      });
      map.addLayer({
        id: 'flood-warnings-circles',
        type: 'circle',
        source: 'flood-warnings',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 7, 10, 15],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.95,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': 'rgba(255,255,255,0.7)',
        },
      });

      // ── Popup Handlers ──
      addPopupHandler(map, 'flood-warnings-circles', popupFloodWarning);
      addPopupHandler(map, 'water-level-stations-circles', popupWaterLevel);
      addPopupHandler(map, 'rainfall-stations-circles', popupRainfall);
      addPopupHandler(map, 'precipitation-circles', popupPrecipitation);
      addPopupHandler(map, 'river-discharge-circles', popupRiverDischarge);
      addPopupHandler(map, 'soil-moisture-circles', popupSoilMoisture);
      addPopupHandler(map, 'tidal-stations-circles', popupTidalStation);
      addPopupHandler(map, 'groundwater-stations-circles', popupGroundwater);
      addPopupHandler(map, 'nrfa-stations-circles', popupNRFAStation);
      addPopupHandler(map, 'extended-weather-circles', popupExtendedWeather);
      addPopupHandler(map, 'met-office-forecast-circles', popupMetOfficeForecast);
      addPopupHandler(map, 'cds-reanalysis-circles', popupCDSReanalysis);
      addPopupHandler(map, 'flood-warning-areas-fill', popupFloodWarningArea);
      addPopupHandler(map, 'flood-risk-areas-fill', popupFloodRiskArea);
      addPopupHandler(map, 'llfa-boundaries-fill', popupLLFA);
      addPopupHandler(map, 'imd-deprivation-fill', popupIMD);
      addPopupHandler(map, 'wfd-catchments-fill', popupWFDCatchment);
      addPopupHandler(map, 'nfm-hotspots-fill', popupNFMHotspot);
      addPopupHandler(map, 'schools-circles', popupSchool);
      addPopupHandler(map, 'hospitals-circles', popupHospital);
      addPopupHandler(map, 'bathing-waters-circles', popupBathingWater);
      addPopupHandler(map, 'ramsar-wetlands-fill', popupRamsar);
      addPopupHandler(map, 'water-company-boundaries-fill', popupWaterCompany);
      addPopupHandler(map, 'edm-overflows-circles', popupEDMOverflow);
      addPopupHandler(map, 'winep-overflows-circles', popupWINEPOverflow);
      addPopupHandler(map, 'main-rivers-line', popupMainRiver);
      addPopupHandler(map, 'historic-floods-fill', popupHistoricFlood);
      addPopupHandler(map, 'flood-defences-line', popupDefence);

      // Track viewport bbox for IMD queries (only at zoom >= 9 where bbox is small enough)
      const updateBbox = () => {
        const zoom = map.getZoom();
        setMapZoom(zoom);
        const b = map.getBounds();
        const bboxStr = `${b.getWest().toFixed(2)},${b.getSouth().toFixed(2)},${b.getEast().toFixed(2)},${b.getNorth().toFixed(2)}`;

        // IMD: zoom >= 9
        setMapBbox(zoom >= 9 ? bboxStr : null);
        // Risk polygon layers: zoom >= 7
        setRiskBbox(zoom >= 7 ? bboxStr : null);
      };
      map.on('moveend', updateBbox);
      updateBbox();

      setMapLoaded(true);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; setMapLoaded(false); };
  }, []);

  // ─── Build a station→reading lookup ─────────────────────────────
  const readingMap = useRef(new Map<string, number>());
  useEffect(() => {
    if (!latestReadings?.items) return;
    const m = new Map<string, number>();
    for (const r of latestReadings.items as Reading[]) {
      // measure URL format: ".../measures/{stationRef}-level-...
      // Extract station reference from start of the measure name segment
      const parts = r.measure?.split('/measures/');
      if (parts && parts.length > 1) {
        const measureName = parts[1]; // e.g. "1029TH-level-downstage-i-15_min-mASD"
        const stationRef = measureName.split('-')[0]; // e.g. "1029TH"
        if (stationRef) m.set(stationRef, r.value);
      }
    }
    readingMap.current = m;
  }, [latestReadings]);

  // ─── Sync flood warnings ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !floods) return;
    const features = (floods.items || []).map((w: FloodWarning) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: getWarningCoords(w) },
      properties: {
        description: w.description ?? '',
        severity: w.severity ?? '',
        severityLevel: w.severityLevel,
        severityLabel: severityLabel(w.severityLevel),
        color: severityColor(w.severityLevel),
        message: w.message ?? '',
        area: w.eaAreaName ?? '',
        timeRaised: w.timeRaised ?? '',
        river: w.floodArea?.riverOrSea ?? '',
      },
    }));
    setSourceData(map, 'flood-warnings', features);
  }, [floods, mapLoaded]);

  // ─── Sync water level stations (color-coded by reading) ────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !levelStations) return;
    const readings = readingMap.current;
    const features = (levelStations.items || [])
      .filter((s: Station) => s.lat && s.long)
      .map((s: Station) => {
        const reading = readings.get(s.stationReference) ?? readings.get(s.notation);
        const color = stationStatusColor(
          reading,
          s.stageScale?.typicalRangeHigh,
          s.stageScale?.typicalRangeLow,
          s.stageScale?.maxOnRecord?.value,
        );
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [s.long, s.lat] },
          properties: {
            label: s.label ?? '',
            riverName: s.riverName ?? '',
            town: s.town ?? '',
            color,
            statusLabel: stationStatusLabel(color),
            reading: reading !== undefined ? Math.round(reading * 100) / 100 : -1,
            typicalRangeHigh: s.stageScale?.typicalRangeHigh ?? -1,
            typicalRangeLow: s.stageScale?.typicalRangeLow ?? -1,
            maxOnRecord: s.stageScale?.maxOnRecord?.value ?? -1,
          },
        };
      });
    setSourceData(map, 'water-level-stations', features);
  }, [levelStations, latestReadings, mapLoaded]);

  // ─── Sync rainfall stations ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !rainStations) return;
    const features = (rainStations.items || [])
      .filter((s: Station) => s.lat && s.long)
      .map((s: Station) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [s.long, s.lat] },
        properties: { label: s.label ?? '', town: s.town ?? '' },
      }));
    setSourceData(map, 'rainfall-stations', features);
  }, [rainStations, mapLoaded]);

  // ─── Sync precipitation grid ───────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !precipGrid) return;
    const features = precipGrid.points.map((p: PrecipitationPoint) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
      properties: {
        name: p.name,
        rain_mm: p.current_rain_mm,
        rain_3h: p.rain_next_3h_mm,
        rain_6h: p.rain_next_6h_mm,
        temp: p.temperature_c,
        wind: p.wind_speed_kmh,
        color: precipColor(p.current_rain_mm),
        radius: precipRadius(p.current_rain_mm),
      },
    }));
    setSourceData(map, 'precipitation', features);
  }, [precipGrid, mapLoaded]);

  // ─── Sync river discharge grid ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !dischargeGrid) return;
    const features = dischargeGrid.points.map((p: RiverDischargePoint) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
      properties: {
        discharge: p.discharge_m3s,
        max24h: p.discharge_max_24h,
        max72h: p.discharge_max_72h,
        color: dischargeColor(p.discharge_m3s),
        radius: dischargeRadius(p.discharge_m3s),
      },
    }));
    setSourceData(map, 'river-discharge', features);
  }, [dischargeGrid, mapLoaded]);

  // ─── Sync soil moisture grid ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !soilGrid) return;
    const features = soilGrid.points.map((p: SoilMoisturePoint) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
      properties: {
        name: p.name,
        moisture: p.moisture_0_7cm,
        moisture_deep: p.moisture_7_28cm,
        temp: p.temperature_c,
        color: soilMoistureColor(p.moisture_0_7cm),
        radius: soilMoistureRadius(p.moisture_0_7cm),
      },
    }));
    setSourceData(map, 'soil-moisture', features);
  }, [soilGrid, mapLoaded]);

  // ─── Sync tidal stations ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !tideStations) return;
    const features = (tideStations.items || [])
      .filter((s: Station) => s.lat && s.long)
      .map((s: Station) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [s.long, s.lat] },
        properties: {
          label: s.label ?? '',
          riverName: s.riverName ?? '',
          town: s.town ?? '',
          stationRef: s.stationReference ?? '',
        },
      }));
    setSourceData(map, 'tidal-stations', features);
  }, [tideStations, mapLoaded]);

  // ─── Sync groundwater stations ─────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !groundwaterStations) return;
    const features = (groundwaterStations.items || [])
      .filter((s: Station) => s.lat && s.long)
      .map((s: Station) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [s.long, s.lat] },
        properties: {
          label: s.label ?? '',
          town: s.town ?? '',
          stationRef: s.stationReference ?? '',
        },
      }));
    setSourceData(map, 'groundwater-stations', features);
  }, [groundwaterStations, mapLoaded]);

  // ─── Sync NRFA stations ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !nrfaStations) return;
    const features = (nrfaStations.stations || [])
      .filter((s: NRFAStation) => s.latitude && s.longitude)
      .map((s: NRFAStation) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [s.longitude, s.latitude] },
        properties: {
          name: s.name,
          river: s.river ?? '',
          catchmentArea: s.catchmentArea ?? -1,
          id: s.id,
        },
      }));
    setSourceData(map, 'nrfa-stations', features);
  }, [nrfaStations, mapLoaded]);

  // ─── Sync flood warning areas ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !floodWarningAreas) return;
    const features = (floodWarningAreas.items || [])
      .filter((a: FloodArea) => a.lat && a.long)
      .map((a: FloodArea) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [a.long, a.lat],
        },
        properties: {
          label: a.label ?? '',
          description: a.description ?? '',
          county: a.county ?? '',
          riverOrSea: a.riverOrSea ?? '',
          fwdCode: a.fwdCode ?? '',
        },
      }));
    setSourceData(map, 'flood-warning-areas', features);
  }, [floodWarningAreas, mapLoaded]);

  // ─── Sync extended weather ─────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !extendedWeather) return;
    const features = extendedWeather.points.map((p: ExtendedWeatherPoint) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
      properties: {
        name: p.name,
        snow_depth: p.snow_depth_m,
        wind_gusts: p.wind_gusts_kmh,
        pressure: p.surface_pressure_hpa,
        cloud_cover: p.cloud_cover_pct,
        color: windGustColor(p.wind_gusts_kmh),
        radius: windGustRadius(p.wind_gusts_kmh),
      },
    }));
    setSourceData(map, 'extended-weather', features);
  }, [extendedWeather, mapLoaded]);

  // ─── Sync Met Office forecast ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !metOfficeForecast) return;
    const features = metOfficeForecast.points.map((p: MetOfficeForecastPoint) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
      properties: {
        name: p.name,
        temperature: p.current.screenTemperature,
        feelsLike: p.current.feelsLikeTemperature,
        windSpeed: p.current.windSpeed10m,
        windGust: p.current.windGustSpeed10m,
        humidity: p.current.screenRelativeHumidity,
        precipRate: p.current.precipitationRate,
        precipProb: p.current.probOfPrecipitation,
        uvIndex: p.current.uvIndex,
        visibility: p.current.visibility,
        pressure: p.current.mslp,
        weatherCode: p.current.significantWeatherCode,
        color: metOfficeColor(p.current.precipitationRate, p.current.probOfPrecipitation),
      },
    }));
    setSourceData(map, 'met-office-forecast', features);
  }, [metOfficeForecast, mapLoaded]);

  // ─── Sync CDS ERA5-Land reanalysis ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !cdsReanalysis) return;
    const features = cdsReanalysis.points.map((p: CDSReanalysisPoint) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
      properties: {
        name: p.name,
        temperature: p.temperature_c,
        precipitation: p.precipitation_mm_h,
        soilMoisture: p.soil_moisture_m3m3,
        snowCover: p.snow_cover_pct,
        dataTime: p.data_time,
        color: cdsReanalysisColor(p.soil_moisture_m3m3, p.precipitation_mm_h),
      },
    }));
    setSourceData(map, 'cds-reanalysis', features);
  }, [cdsReanalysis, mapLoaded]);

  // ─── Sync flood defences ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !defences) return;
    const src = map.getSource('flood-defences') as maplibregl.GeoJSONSource;
    if (src) src.setData(defences as any);
  }, [defences, mapLoaded]);

  // ─── Sync historic floods ─────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !historicFloods) return;
    const src = map.getSource('historic-floods') as maplibregl.GeoJSONSource;
    if (src) src.setData(historicFloods as any);
  }, [historicFloods, mapLoaded]);

  // ─── Sync main rivers ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !mainRivers) return;
    const src = map.getSource('main-rivers') as maplibregl.GeoJSONSource;
    if (src) src.setData(mainRivers as any);
  }, [mainRivers, mapLoaded]);

  // ─── Sync flood risk areas (Defra APSFR) ─────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !floodRiskAreas) return;
    const src = map.getSource('flood-risk-areas') as maplibregl.GeoJSONSource;
    if (src) src.setData(floodRiskAreas as any);
  }, [floodRiskAreas, mapLoaded]);

  // ─── Sync LLFA boundaries ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !llfaBoundaries) return;
    const src = map.getSource('llfa-boundaries') as maplibregl.GeoJSONSource;
    if (src) src.setData(llfaBoundaries as any);
  }, [llfaBoundaries, mapLoaded]);

  // ─── LLFA choropleth paint sync ─────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !map.getLayer('llfa-boundaries-fill')) return;
    const paint = getLLFAChoroplethPaint(llfaChoropleth);
    map.setPaintProperty('llfa-boundaries-fill', 'fill-color', paint.fillColor);
    map.setPaintProperty('llfa-boundaries-fill', 'fill-opacity', paint.fillOpacity);
    map.setPaintProperty('llfa-boundaries-outline', 'line-color', paint.lineColor);
    map.setPaintProperty('llfa-boundaries-outline', 'line-opacity', paint.lineOpacity);
  }, [llfaChoropleth, mapLoaded]);

  // ─── Sync IMD deprivation boundaries ────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !imdData) return;
    const src = map.getSource('imd-deprivation') as maplibregl.GeoJSONSource;
    if (src) src.setData(imdData as any);
  }, [imdData, mapLoaded]);

  // ─── Sync WFD catchments ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !wfdCatchments) return;
    const src = map.getSource('wfd-catchments') as maplibregl.GeoJSONSource;
    if (src) src.setData(wfdCatchments as any);
  }, [wfdCatchments, mapLoaded]);

  // ─── Sync NFM hotspots ──────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !nfmHotspots) return;
    const src = map.getSource('nfm-hotspots') as maplibregl.GeoJSONSource;
    if (src) src.setData(nfmHotspots as any);
  }, [nfmHotspots, mapLoaded]);

  // ─── Sync schools ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !schools) return;
    const src = map.getSource('schools') as maplibregl.GeoJSONSource;
    if (src) src.setData(schools as any);
  }, [schools, mapLoaded]);

  // ─── Sync hospitals ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !hospitals) return;
    const src = map.getSource('hospitals') as maplibregl.GeoJSONSource;
    if (src) src.setData(hospitals as any);
  }, [hospitals, mapLoaded]);

  // ─── Sync bathing waters ──────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !bathingWaters) return;
    const src = map.getSource('bathing-waters') as maplibregl.GeoJSONSource;
    if (src) src.setData(bathingWaters as any);
  }, [bathingWaters, mapLoaded]);

  // ─── Sync Ramsar Wetlands ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !ramsarWetlands) return;
    const src = map.getSource('ramsar-wetlands') as maplibregl.GeoJSONSource;
    if (src) src.setData(ramsarWetlands as any);
  }, [ramsarWetlands, mapLoaded]);

  // ─── Sync Water Company Boundaries ───────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !waterCompanyBoundaries) return;
    const src = map.getSource('water-company-boundaries') as maplibregl.GeoJSONSource;
    if (src) src.setData(waterCompanyBoundaries as any);
  }, [waterCompanyBoundaries, mapLoaded]);

  // ─── Sync EDM Storm Overflows ────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !edmOverflows) return;
    const src = map.getSource('edm-overflows') as maplibregl.GeoJSONSource;
    if (src) src.setData(edmOverflows as any);
  }, [edmOverflows, mapLoaded]);

  // ─── Sync WINEP Storm Overflows ────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !winepOverflows) return;
    const src = map.getSource('winep-overflows') as maplibregl.GeoJSONSource;
    if (src) src.setData(winepOverflows as any);
  }, [winepOverflows, mapLoaded]);

  // ─── Sync risk polygon layers ──────────────────────────────
  const riskDataMap: Record<string, typeof riskRiversSeaData> = {
    'risk-rivers-sea': riskRiversSeaData,
    'risk-surface-water': riskSurfaceWaterData,
    'flood-zone-2': floodZone2Data,
    'flood-zone-3': floodZone3Data,
    'reservoir-dry': reservoirDryData,
    'reservoir-wet': reservoirWetData,
  };
  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map) return;
    for (const [id, data] of Object.entries(riskDataMap)) {
      if (!data) continue;
      const src = map.getSource(id) as maplibregl.GeoJSONSource;
      if (src) src.setData(data as any);
    }
  }, [riskRiversSeaData, riskSurfaceWaterData, floodZone2Data, floodZone3Data, reservoirDryData, reservoirWetData, mapLoaded]);

  // ─── Sync layer visibility ────────────────────────────────────
  const syncVisibility = useCallback(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map) return;

    const layerMapping: Record<string, string[]> = {
      'flood-warnings': ['flood-warnings-circles', 'flood-warnings-pulse'],
      'water-level-stations': ['water-level-stations-circles'],
      'rainfall-stations': ['rainfall-stations-circles'],
      'tidal-stations': ['tidal-stations-circles'],
      'groundwater-stations': ['groundwater-stations-circles'],
      'nrfa-stations': ['nrfa-stations-circles'],
      'precipitation': ['precipitation-circles', 'precipitation-halo'],
      'river-discharge': ['river-discharge-circles'],
      'soil-moisture': ['soil-moisture-circles'],
      'extended-weather': ['extended-weather-circles'],
      'met-office-forecast': ['met-office-forecast-circles'],
      'cds-reanalysis': ['cds-reanalysis-circles'],
      'risk-rivers-sea': ['risk-rivers-sea-fill', 'risk-rivers-sea-outline'],
      'risk-surface-water': ['risk-surface-water-fill', 'risk-surface-water-outline'],
      'flood-zone-2': ['flood-zone-2-fill', 'flood-zone-2-outline'],
      'flood-zone-3': ['flood-zone-3-fill', 'flood-zone-3-outline'],
      'reservoir-dry': ['reservoir-dry-fill', 'reservoir-dry-outline'],
      'reservoir-wet': ['reservoir-wet-fill', 'reservoir-wet-outline'],
      'flood-warning-areas': ['flood-warning-areas-fill', 'flood-warning-areas-outline'],
      'flood-risk-areas': ['flood-risk-areas-fill', 'flood-risk-areas-outline'],
      'llfa-boundaries': ['llfa-boundaries-fill', 'llfa-boundaries-outline'],
      'imd-deprivation': ['imd-deprivation-fill', 'imd-deprivation-outline'],
      'wfd-catchments': ['wfd-catchments-fill', 'wfd-catchments-outline'],
      'nfm-hotspots': ['nfm-hotspots-fill', 'nfm-hotspots-outline'],
      'schools': ['schools-circles'],
      'hospitals': ['hospitals-circles'],
      'bathing-waters': ['bathing-waters-circles'],
      'ramsar-wetlands': ['ramsar-wetlands-fill', 'ramsar-wetlands-outline'],
      'water-company-boundaries': ['water-company-boundaries-fill', 'water-company-boundaries-outline'],
      'edm-overflows': ['edm-overflows-circles'],
      'winep-overflows': ['winep-overflows-circles'],
      'flood-defences': ['flood-defences-line', 'flood-defences-fill'],
      'historic-floods': ['historic-floods-fill', 'historic-floods-outline'],
      'main-rivers': ['main-rivers-line'],
      'os-map-light': ['os-map-light-tiles'],
      'os-map-road': ['os-map-road-tiles'],
      'os-map-outdoor': ['os-map-outdoor-tiles'],
    };

    for (const [layerId, mapLayerIds] of Object.entries(layerMapping)) {
      const visible = visibleLayers.has(layerId);
      for (const mlId of mapLayerIds) {
        if (map.getLayer(mlId)) {
          map.setLayoutProperty(mlId, 'visibility', visible ? 'visible' : 'none');
        }
      }
    }
  }, [visibleLayers, mapLoaded]);

  useEffect(() => { syncVisibility(); }, [syncVisibility]);

  return <div ref={mapContainer} className="w-full h-full pointer-events-auto" data-tour="map" />;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function setSourceData(map: maplibregl.Map, sourceId: string, features: any[]) {
  const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
  if (src) src.setData({ type: 'FeatureCollection', features });
}

function addRiskPolygonLayer(map: maplibregl.Map, id: string, color: string) {
  map.addSource(id, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addLayer({
    id: `${id}-fill`,
    type: 'fill',
    source: id,
    paint: { 'fill-color': color, 'fill-opacity': 0.35 },
    layout: { visibility: 'none' },
  });
  map.addLayer({
    id: `${id}-outline`,
    type: 'line',
    source: id,
    paint: {
      'line-color': color,
      'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 2],
      'line-opacity': 0.6,
    },
    layout: { visibility: 'none' },
  });
}

function addOSTileLayer(map: maplibregl.Map, id: string, config: { url: string }) {
  map.addSource(`${id}-tiles`, {
    type: 'raster',
    tiles: [config.url],
    tileSize: 256,
    minzoom: 0,
    maxzoom: 20,
    attribution: '© Ordnance Survey',
  });
  map.addLayer({
    id: `${id}-tiles`,
    type: 'raster',
    source: `${id}-tiles`,
    paint: { 'raster-opacity': 0.85 },
    layout: { visibility: 'none' },
  });
}

function addPopupHandler(
  map: maplibregl.Map,
  layerId: string,
  renderHTML: (props: Record<string, string | number>) => string,
) {
  map.on('click', layerId, (e) => {
    if (!e.features?.length) return;
    const props = e.features[0].properties as Record<string, string | number>;
    const geom = e.features[0].geometry;
    const coords: [number, number] = geom.type === 'Point'
      ? (geom as GeoJSON.Point).coordinates.slice() as [number, number]
      : [e.lngLat.lng, e.lngLat.lat];

    new maplibregl.Popup({ closeButton: true, maxWidth: '340px' })
      .setLngLat(coords)
      .setHTML(renderHTML(props))
      .addTo(map);
  });
  map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
}

// ─── Popup Templates ─────────────────────────────────────────────────

function popupFloodWarning(p: Record<string, string | number>) {
  return `<div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full shadow-sm" style="background:${p.color}"></span>
      <span class="font-bold text-xs">${p.severityLabel}</span>
    </div>
    <p class="text-[11px] opacity-90 font-medium">${p.description || ''}</p>
    <p class="text-[10px] opacity-50">${p.area || ''}${p.river ? ` · ${p.river}` : ''}</p>
    ${p.message ? `<p class="text-[10px] mt-1 leading-relaxed opacity-60">${truncate(String(p.message), 200)}</p>` : ''}
    <p class="text-[9px] opacity-40 mt-1">Raised: ${formatTime(String(p.timeRaised))}</p>
  </div>`;
}

function popupWaterLevel(p: Record<string, string | number>) {
  const reading = Number(p.reading);
  const hasReading = reading >= 0;
  const typHigh = Number(p.typicalRangeHigh);
  const typLow = Number(p.typicalRangeLow);
  const maxRec = Number(p.maxOnRecord);
  return `<div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${p.color}"></span>
      <span class="font-bold text-xs">${p.label || 'Station'}</span>
      <span class="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style="background:${p.color}22;color:${p.color}">${p.statusLabel}</span>
    </div>
    <p class="text-[10px] opacity-60">${p.riverName ? `River ${p.riverName}` : ''}${p.town ? ` · ${p.town}` : ''}</p>
    ${hasReading ? `<p class="text-xs font-mono font-semibold">${reading.toFixed(2)}m</p>` : ''}
    ${typHigh >= 0 ? `<p class="text-[10px] opacity-50">Typical: ${typLow >= 0 ? typLow.toFixed(2) : '?'}m – ${typHigh.toFixed(2)}m</p>` : ''}
    ${maxRec > 0 ? `<p class="text-[10px] opacity-40">Record max: ${maxRec.toFixed(2)}m</p>` : ''}
  </div>`;
}

function popupRainfall(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <p class="font-bold text-xs">${p.label || 'Rain Gauge'}</p>
    <p class="text-[10px] opacity-60">${p.town || ''}</p>
  </div>`;
}

function popupPrecipitation(p: Record<string, string | number>) {
  return `<div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${p.color}"></span>
      <span class="font-bold text-xs">${p.name}</span>
    </div>
    <div class="grid grid-cols-2 gap-1 text-[10px]">
      <span class="opacity-50">Current rain:</span><span class="font-mono font-semibold">${p.rain_mm}mm/h</span>
      <span class="opacity-50">Next 3h:</span><span class="font-mono">${p.rain_3h}mm</span>
      <span class="opacity-50">Next 6h:</span><span class="font-mono">${p.rain_6h}mm</span>
      <span class="opacity-50">Temperature:</span><span class="font-mono">${p.temp}°C</span>
      <span class="opacity-50">Wind:</span><span class="font-mono">${p.wind} km/h</span>
    </div>
  </div>`;
}

function popupRiverDischarge(p: Record<string, string | number>) {
  const q = Number(p.discharge);
  const max24 = Number(p.max24h);
  const max72 = Number(p.max72h);
  return `<div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${p.color}"></span>
      <span class="font-bold text-xs">River Discharge</span>
    </div>
    <div class="grid grid-cols-2 gap-1 text-[10px]">
      <span class="opacity-50">Current:</span><span class="font-mono font-semibold">${q.toFixed(1)} m³/s</span>
      <span class="opacity-50">Max 24h:</span><span class="font-mono">${max24.toFixed(1)} m³/s</span>
      <span class="opacity-50">Max 72h:</span><span class="font-mono">${max72.toFixed(1)} m³/s</span>
    </div>
  </div>`;
}

function popupHistoricFlood(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <p class="font-bold text-xs">Historic Flood Event</p>
    ${p.FLOOD_EVENT_NAME ? `<p class="text-[11px] opacity-80">${p.FLOOD_EVENT_NAME}</p>` : ''}
    ${p.FLOOD_YEAR ? `<p class="text-[10px] opacity-50">Year: ${p.FLOOD_YEAR}</p>` : ''}
    ${p.FLOOD_CAUSE ? `<p class="text-[10px] opacity-50">Cause: ${p.FLOOD_CAUSE}</p>` : ''}
    ${p.FLOOD_SOURCE ? `<p class="text-[10px] opacity-40">Source: ${p.FLOOD_SOURCE}</p>` : ''}
  </div>`;
}

function popupDefence(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <p class="font-bold text-xs">Flood Defence</p>
    ${p.ASSET_TYPE ? `<p class="text-[11px] opacity-80">${p.ASSET_TYPE}</p>` : ''}
    ${p.ASSET_CONDITION ? `<p class="text-[10px] opacity-50">Condition: ${p.ASSET_CONDITION}</p>` : ''}
    ${p.MAINTAINED_BY ? `<p class="text-[10px] opacity-40">Maintained by: ${p.MAINTAINED_BY}</p>` : ''}
  </div>`;
}

function popupSoilMoisture(p: Record<string, string | number>) {
  const m = Number(p.moisture);
  const mDeep = Number(p.moisture_deep);
  const pct = Math.round(m * 100);
  let status = 'Dry';
  if (m >= 0.4) status = 'Saturated';
  else if (m >= 0.3) status = 'Very Wet';
  else if (m >= 0.2) status = 'Moist';
  else if (m >= 0.1) status = 'Normal';
  return `<div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${p.color}"></span>
      <span class="font-bold text-xs">${p.name}</span>
      <span class="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style="background:${p.color}22;color:${p.color}">${status}</span>
    </div>
    <div class="grid grid-cols-2 gap-1 text-[10px]">
      <span class="opacity-50">Surface (0–7cm):</span><span class="font-mono font-semibold">${pct}%</span>
      <span class="opacity-50">Deeper (7–28cm):</span><span class="font-mono">${Math.round(mDeep * 100)}%</span>
      <span class="opacity-50">Temperature:</span><span class="font-mono">${p.temp}°C</span>
    </div>
  </div>`;
}

function popupTidalStation(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:#06b6d4"></span>
      <span class="font-bold text-xs">${p.label || 'Tide Gauge'}</span>
    </div>
    <p class="text-[10px] opacity-60">${p.riverName ? `${p.riverName}` : ''}${p.town ? ` · ${p.town}` : ''}</p>
    ${p.stationRef ? `<p class="text-[9px] opacity-40">Ref: ${p.stationRef}</p>` : ''}
  </div>`;
}

function popupMainRiver(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-4 h-0.5 rounded-full" style="background:#2563eb"></span>
      <span class="font-bold text-xs">Main River</span>
    </div>
    ${p.status ? `<p class="text-[10px] opacity-60">Status: ${p.status}</p>` : ''}
    ${p.length_km ? `<p class="text-[10px] opacity-50">Length: ${Number(p.length_km).toFixed(1)} km</p>` : ''}
  </div>`;
}

function popupGroundwater(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:#0d9488"></span>
      <span class="font-bold text-xs">${p.label || 'Groundwater Station'}</span>
    </div>
    ${p.town ? `<p class="text-[10px] opacity-60">${p.town}</p>` : ''}
    ${p.stationRef ? `<p class="text-[9px] opacity-40">Ref: ${p.stationRef}</p>` : ''}
  </div>`;
}

function popupNRFAStation(p: Record<string, string | number>) {
  const area = Number(p.catchmentArea);
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:#e11d48"></span>
      <span class="font-bold text-xs">${p.name || 'NRFA Station'}</span>
    </div>
    ${p.river ? `<p class="text-[10px] opacity-60">River: ${p.river}</p>` : ''}
    ${area > 0 ? `<p class="text-[10px] opacity-50">Catchment: ${area.toFixed(1)} km²</p>` : ''}
    <p class="text-[9px] opacity-40">NRFA ID: ${p.id}</p>
  </div>`;
}

function popupExtendedWeather(p: Record<string, string | number>) {
  const snow = Number(p.snow_depth);
  const gusts = Number(p.wind_gusts);
  const pressure = Number(p.pressure);
  const cloud = Number(p.cloud_cover);
  return `<div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${p.color}"></span>
      <span class="font-bold text-xs">${p.name}</span>
    </div>
    <div class="grid grid-cols-2 gap-1 text-[10px]">
      <span class="opacity-50">Wind gusts:</span><span class="font-mono font-semibold">${gusts.toFixed(0)} km/h</span>
      <span class="opacity-50">Snow depth:</span><span class="font-mono">${snow.toFixed(2)} m</span>
      <span class="opacity-50">Pressure:</span><span class="font-mono">${pressure.toFixed(0)} hPa</span>
      <span class="opacity-50">Cloud cover:</span><span class="font-mono">${cloud.toFixed(0)}%</span>
    </div>
  </div>`;
}

function popupMetOfficeForecast(p: Record<string, string | number>) {
  const temp = Number(p.temperature);
  const feelsLike = Number(p.feelsLike);
  const wind = Number(p.windSpeed);
  const gust = Number(p.windGust);
  const humidity = Number(p.humidity);
  const precip = Number(p.precipRate);
  const prob = Number(p.precipProb);
  const uv = Number(p.uvIndex);
  const vis = Number(p.visibility);
  const pressure = Number(p.pressure);
  return `<div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${p.color}"></span>
      <span class="font-bold text-xs">${p.name}</span>
      <span class="text-[9px] opacity-40 ml-auto">Met Office</span>
    </div>
    <div class="grid grid-cols-2 gap-1 text-[10px]">
      <span class="opacity-50">Temperature:</span><span class="font-mono font-semibold">${temp.toFixed(1)}°C</span>
      <span class="opacity-50">Feels like:</span><span class="font-mono">${feelsLike.toFixed(1)}°C</span>
      <span class="opacity-50">Wind:</span><span class="font-mono">${wind.toFixed(1)} m/s</span>
      <span class="opacity-50">Gusts:</span><span class="font-mono">${gust.toFixed(1)} m/s</span>
      <span class="opacity-50">Humidity:</span><span class="font-mono">${humidity.toFixed(0)}%</span>
      <span class="opacity-50">Rain rate:</span><span class="font-mono">${precip.toFixed(1)} mm/h</span>
      <span class="opacity-50">Rain prob:</span><span class="font-mono">${prob.toFixed(0)}%</span>
      <span class="opacity-50">UV index:</span><span class="font-mono">${uv}</span>
      <span class="opacity-50">Visibility:</span><span class="font-mono">${(vis / 1000).toFixed(1)} km</span>
      <span class="opacity-50">Pressure:</span><span class="font-mono">${(pressure / 100).toFixed(0)} hPa</span>
    </div>
  </div>`;
}

function popupCDSReanalysis(p: Record<string, string | number>) {
  const temp = Number(p.temperature);
  const precip = Number(p.precipitation);
  const soil = Number(p.soilMoisture);
  const snow = Number(p.snowCover);
  return `<div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${p.color}"></span>
      <span class="font-bold text-xs">${p.name}</span>
      <span class="text-[9px] opacity-40 ml-auto">ERA5-Land</span>
    </div>
    <div class="grid grid-cols-2 gap-1 text-[10px]">
      <span class="opacity-50">Temperature:</span><span class="font-mono font-semibold">${temp.toFixed(1)}°C</span>
      <span class="opacity-50">Precipitation:</span><span class="font-mono">${precip.toFixed(2)} mm/h</span>
      <span class="opacity-50">Soil moisture:</span><span class="font-mono">${(soil * 100).toFixed(1)}%</span>
      <span class="opacity-50">Snow cover:</span><span class="font-mono">${snow.toFixed(1)}%</span>
    </div>
    <p class="text-[9px] opacity-40">Data: ${p.dataTime}</p>
  </div>`;
}

function popupFloodWarningArea(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:#fbbf24"></span>
      <span class="font-bold text-xs">${p.label || 'Flood Warning Area'}</span>
    </div>
    ${p.description ? `<p class="text-[11px] opacity-80">${truncate(String(p.description), 200)}</p>` : ''}
    ${p.county ? `<p class="text-[10px] opacity-50">${p.county}</p>` : ''}
    ${p.riverOrSea ? `<p class="text-[10px] opacity-50">River/Sea: ${p.riverOrSea}</p>` : ''}
    ${p.fwdCode ? `<p class="text-[9px] opacity-40">Code: ${p.fwdCode}</p>` : ''}
  </div>`;
}

function popupFloodRiskArea(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-sm border" style="background:#e879f933;border-color:#e879f9"></span>
      <span class="font-bold text-xs">${p.fra_name || 'Flood Risk Area'}</span>
    </div>
    ${p.flood_source ? `<p class="text-[11px] opacity-80">Source: ${p.flood_source}</p>` : ''}
    ${p.fra_id ? `<p class="text-[9px] opacity-40">ID: ${p.fra_id}</p>` : ''}
    ${p.frr_cycle ? `<p class="text-[9px] opacity-40">FRR Cycle: ${p.frr_cycle}</p>` : ''}
  </div>`;
}

function popupLLFA(p: Record<string, string | number>) {
  const name = p.CTYUA24NM || 'LLFA';
  const code = p.CTYUA24CD || '';
  const hasStrategy = String(p.hasStrategy) === 'true';
  const statusColor = hasStrategy ? '#10b981' : '#64748b';
  const statusLabel = hasStrategy ? 'LFRMS Available' : 'No LFRMS Data';

  // Flood management stats
  const defenceCount = p.defenceCount != null && p.defenceCount !== '' ? Number(p.defenceCount) : null;
  const totalSpend = p.totalSpend != null && p.totalSpend !== '' ? Number(p.totalSpend) : null;
  const propertiesHighRisk = p.propertiesHighRisk != null && p.propertiesHighRisk !== '' ? Number(p.propertiesHighRisk) : null;
  const propertiesHighRiskPct = p.propertiesHighRiskPct != null && p.propertiesHighRiskPct !== '' ? Number(p.propertiesHighRiskPct) : null;
  const homesProtected = p.homesProtected != null && p.homesProtected !== '' ? Number(p.homesProtected) : null;
  const defenceCondition = p.defenceCondition != null && p.defenceCondition !== '' ? Number(p.defenceCondition) : null;
  const hasStats = defenceCount != null || totalSpend != null || propertiesHighRisk != null || homesProtected != null;

  const statsHTML = hasStats ? `
    <div class="border-t border-white/10 pt-1.5 mt-1.5 space-y-1">
      <p class="text-[9px] font-semibold opacity-60">Flood Management</p>
      <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
        ${defenceCount != null ? `<span class="opacity-50">Defences:</span><span class="font-mono">${defenceCount.toLocaleString()}</span>` : ''}
        ${defenceCondition != null ? `<span class="opacity-50">Avg condition:</span><span class="font-mono">${defenceCondition.toFixed(2)}/5</span>` : ''}
        ${totalSpend != null ? `<span class="opacity-50">Capital spend:</span><span class="font-mono">${fmtMoney(totalSpend)}</span>` : ''}
        ${propertiesHighRisk != null ? `<span class="opacity-50">High-risk props:</span><span class="font-mono">${propertiesHighRisk.toLocaleString()}${propertiesHighRiskPct != null ? ` (${propertiesHighRiskPct}%)` : ''}</span>` : ''}
        ${homesProtected != null ? `<span class="opacity-50">Homes protected:</span><span class="font-mono">${homesProtected.toLocaleString()}</span>` : ''}
      </div>
    </div>` : '';

  let strategyHTML = '';
  if (hasStrategy && p.strategy) {
    try {
      const s = typeof p.strategy === 'string' ? JSON.parse(p.strategy) : p.strategy;
      const qBadge = (val: string) => {
        if (!val) return '';
        const c = val === 'A' ? '#10b981' : val === 'B' ? '#eab308' : val === 'C' ? '#ef4444' : '#64748b';
        return `<span style="color:${c};font-weight:700">${val}</span>`;
      };
      strategyHTML = `
        <div class="border-t border-white/10 pt-1.5 mt-1.5 space-y-1">
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            <span class="opacity-50">Published:</span><span class="font-mono">${s.yearPublished ?? '—'}</span>
            <span class="opacity-50">Active period:</span><span class="font-mono">${s.activePeriod || '—'}</span>
            <span class="opacity-50">Word count:</span><span class="font-mono">${s.wordCount?.toLocaleString() ?? '—'}</span>
            <span class="opacity-50">Living document:</span><span>${s.isLivingDocument || '—'}</span>
            <span class="opacity-50">External consultant:</span><span>${s.externalConsultant || '—'}</span>
            <span class="opacity-50">Coastal area:</span><span>${s.isCoastalArea || '—'}</span>
          </div>
          <p class="text-[9px] font-semibold opacity-60 mt-1">Strategy Quality</p>
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            <span class="opacity-50">Clear objectives:</span>${qBadge(s.quality?.clearObjectives)}
            <span class="opacity-50">SMART objectives:</span>${qBadge(s.quality?.smartObjectives)}
            <span class="opacity-50">M&E approaches:</span>${qBadge(s.quality?.monitoringEvaluation)}
            <span class="opacity-50">CC scenarios:</span>${qBadge(s.quality?.climateChangeScenarios)}
            <span class="opacity-50">CC risk assessment:</span>${qBadge(s.quality?.climateChangeRisk)}
            <span class="opacity-50">Surface water:</span>${qBadge(s.quality?.surfaceWaterMeasures)}
            <span class="opacity-50">FCERM alignment:</span>${qBadge(s.quality?.fcermAlignment)}
          </div>
          <p class="text-[9px] font-semibold opacity-60 mt-1">Key Stakeholder Mentions</p>
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            <span class="opacity-50">Env. Agency:</span><span class="font-mono">${s.stakeholders?.eaMentions ?? '—'}</span>
            <span class="opacity-50">DEFRA:</span><span class="font-mono">${s.stakeholders?.defraMentions ?? '—'}</span>
            <span class="opacity-50">Water companies:</span><span class="font-mono text-[9px]">${truncate(s.stakeholders?.waterCompanyMentions || '—', 30)}</span>
            <span class="opacity-50">RFCCs:</span><span class="font-mono">${s.stakeholders?.rfccMentions ?? '—'}</span>
            <span class="opacity-50">Public:</span><span class="font-mono">${s.stakeholders?.publicMentions ?? '—'}</span>
          </div>
          <p class="text-[9px] font-semibold opacity-60 mt-1">Key Term Mentions</p>
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            <span class="opacity-50">SuDS:</span><span class="font-mono">${s.termMentions?.suds ?? '—'}</span>
            <span class="opacity-50">NFM:</span><span class="font-mono">${s.termMentions?.nfm ?? '—'}</span>
            <span class="opacity-50">NBS:</span><span class="font-mono">${s.termMentions?.natureBasedSolutions ?? '—'}</span>
            <span class="opacity-50">Climate change:</span><span class="font-mono">${s.termMentions?.climateChange ?? '—'}</span>
            <span class="opacity-50">Resilience:</span><span class="font-mono">${s.termMentions?.resilience ?? '—'}</span>
            <span class="opacity-50">Green/Blue infra:</span><span class="font-mono">${s.termMentions?.greenBlueInfra ?? '—'}</span>
          </div>
        </div>`;
    } catch { /* strategy parse failed — show basic info only */ }
  }

  return `<div class="space-y-1" style="max-height:420px;overflow-y:auto">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-sm border" style="background:${statusColor}33;border-color:${statusColor}"></span>
      <span class="font-bold text-xs">${name}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style="background:${statusColor}22;color:${statusColor}">${statusLabel}</span>
    </div>
    ${code ? `<p class="text-[9px] opacity-40">ONS Code: ${code}</p>` : ''}
    ${statsHTML}
    ${strategyHTML}
  </div>`;
}

function popupIMD(p: Record<string, string | number>) {
  const decile = Number(p.imdDecile);
  const decileLabel = decile === 1 ? '1 (Most Deprived)' : decile === 10 ? '10 (Least Deprived)' : String(decile);
  const row = (label: string, val: string | number | undefined) =>
    `<div class="flex justify-between gap-4"><span class="opacity-60">${label}</span><span class="font-medium">${val ?? 'N/A'}</span></div>`;
  const score = typeof p.imdScore === 'number' ? p.imdScore.toFixed(2) : p.imdScore;
  const rank = typeof p.imdRank === 'number' ? p.imdRank.toLocaleString() : p.imdRank;
  const pop = typeof p.totalPop === 'number' ? p.totalPop.toLocaleString() : p.totalPop;
  return `<div class="text-xs space-y-1" style="max-width:230px">
    <p class="font-semibold text-sm">${p.lsoaName ?? p.lsoaCode}</p>
    <p class="opacity-50 text-[10px]">${p.ladName} · ${p.lsoaCode}</p>
    <div class="border-t border-white/10 pt-1 space-y-0.5">
      <p class="font-semibold text-[11px] uppercase tracking-wide opacity-50 mb-1">IMD 2019</p>
      ${row('Overall Decile', decileLabel)}
      ${row('IMD Score', score)}
      ${row('IMD Rank', rank)}
    </div>
    <div class="border-t border-white/10 pt-1 space-y-0.5 text-[10px]">
      <p class="font-semibold uppercase tracking-wide opacity-50 mb-1">Domain Deciles</p>
      ${row('Income', p.incomeDecile)}
      ${row('Employment', p.employmentDecile)}
      ${row('Education', p.educationDecile)}
      ${row('Health', p.healthDecile)}
      ${row('Crime', p.crimeDecile)}
      ${row('Barriers', p.barriersDecile)}
      ${row('Living Env.', p.livingEnvDecile)}
    </div>
    <p class="text-[10px] opacity-40 pt-1">Pop: ${pop}</p>
  </div>`;
}

function popupWFDCatchment(p: Record<string, string | number>) {
  const name = p.wb_name && String(p.wb_name).trim() ? p.wb_name : 'Unnamed Catchment';
  const areaKm2 = p.area_km2 != null ? Number(p.area_km2).toLocaleString('en-GB', { maximumFractionDigits: 1 }) : '—';
  const lengthKm = p.length_km != null ? Number(p.length_km).toLocaleString('en-GB', { maximumFractionDigits: 1 }) : '—';
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-sm border" style="background:#0891b233;border-color:#0891b2"></span>
      <span class="font-bold text-xs">${name}</span>
    </div>
    ${p.wb_cat ? `<p class="text-[11px] opacity-80">${p.wb_cat}</p>` : ''}
    ${p.rbd_name ? `<p class="text-[11px] opacity-70">RBD: ${p.rbd_name}</p>` : ''}
    <p class="text-[10px] opacity-60">Area: ${areaKm2} km² · Length: ${lengthKm} km</p>
    ${p.wb_id && String(p.wb_id).trim() ? `<p class="text-[9px] opacity-40">WB ID: ${p.wb_id}</p>` : ''}
  </div>`;
}

function popupNFMHotspot(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-sm border" style="background:#84cc1633;border-color:#84cc16"></span>
      <span class="font-bold text-xs">${p.layer || 'NFM Hotspot'}</span>
    </div>
    <p class="text-[10px] opacity-70">Priority area for Natural Flood Management interventions</p>
  </div>`;
}

function popupSchool(p: Record<string, string | number>) {
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:#f59e0b"></span>
      <span class="font-bold text-xs">${p.name || 'School'}</span>
    </div>
    <p class="text-[10px] opacity-60">${p.type}${p.phase ? ` · ${p.phase}` : ''}</p>
    <p class="text-[10px] opacity-60">${p.town ? `${p.town}, ` : ''}${p.postcode || ''}</p>
    <p class="text-[10px] opacity-50">${p.la || ''}${p.constituency ? ` · ${p.constituency}` : ''}</p>
  </div>`;
}

function popupHospital(p: Record<string, string | number>) {
  const svcTypes = String(p.serviceTypes || '').replace(/\|/g, ', ');
  const cqcLink = p.cqcUrl ? `<a href="${p.cqcUrl}" target="_blank" rel="noopener" class="text-[9px] underline opacity-50 hover:opacity-80">CQC page →</a>` : '';
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:#ec4899"></span>
      <span class="font-bold text-xs">${p.name || 'Health / Care Location'}</span>
    </div>
    ${svcTypes ? `<p class="text-[10px] opacity-70">${svcTypes}</p>` : ''}
    <p class="text-[10px] opacity-60">${p.address ? `${p.address}, ` : ''}${p.postcode || ''}</p>
    <p class="text-[10px] opacity-50">${p.la || ''}${p.region ? ` · ${p.region}` : ''}</p>
    ${p.provider ? `<p class="text-[9px] opacity-40">Provider: ${p.provider}</p>` : ''}
    ${cqcLink}
  </div>`;
}

function popupBathingWater(p: Record<string, string | number>) {
  const cl = String(p.classification || 'Unknown');
  const clColor: Record<string, string> = { 'Excellent': '#3b82f6', 'Good': '#22c55e', 'Sufficient': '#eab308', 'Poor': '#ef4444' };
  const color = clColor[cl] || '#94a3b8';
  const yr = p.classificationYear ? ` (${p.classificationYear})` : '';
  const bwqLink = p.bwqUrl ? `<a href="${p.bwqUrl}" target="_blank" rel="noopener" class="text-[9px] underline opacity-50 hover:opacity-80">EA profile →</a>` : '';
  const season = (p.seasonStart && p.seasonEnd) ? `<p class="text-[10px] opacity-50">Season: ${p.seasonStart} — ${p.seasonEnd}</p>` : '';
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${color}"></span>
      <span class="font-bold text-xs">${p.name || 'Bathing Water'}</span>
    </div>
    <p class="text-[10px]"><span class="font-semibold" style="color:${color}">${cl}</span>${yr}</p>
    ${p.district ? `<p class="text-[10px] opacity-60">${p.district}${p.county ? `, ${p.county}` : ''}</p>` : ''}
    ${season}
    ${String(p.pollutionRiskForecasting) === 'true' ? '<p class="text-[9px] opacity-50">⚠ Pollution risk forecasting active</p>' : ''}
    ${p.sewerageUndertaker ? `<p class="text-[9px] opacity-40">${p.sewerageUndertaker}</p>` : ''}
    ${bwqLink}
  </div>`;
}

function popupRamsar(p: Record<string, string | number>) {
  const area = Number(p.area_ha);
  const areaStr = area > 0 ? `${area.toLocaleString('en-GB', { maximumFractionDigits: 0 })} ha` : '';
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-sm border" style="background:#05966933;border-color:#059669"></span>
      <span class="font-bold text-xs">${p.name || 'Ramsar Wetland'}</span>
    </div>
    <p class="text-[10px] opacity-70">Wetland of International Importance</p>
    ${areaStr ? `<p class="text-[10px] opacity-60">${areaStr}</p>` : ''}
    ${p.code ? `<p class="text-[9px] opacity-40">${p.code}</p>` : ''}
  </div>`;
}

function popupWaterCompany(p: Record<string, string | number>) {
  const typeLabel = String(p.coType || '').replace(/^\w/, (c: string) => c.toUpperCase());
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-sm border" style="background:#7c3aed22;border-color:#7c3aed"></span>
      <span class="font-bold text-xs">${p.company || 'Water Company'}</span>
    </div>
    ${p.acronym ? `<p class="text-[10px] opacity-70">${p.acronym}</p>` : ''}
    ${typeLabel ? `<p class="text-[10px] opacity-60">${typeLabel}</p>` : ''}
    ${p.areaType ? `<p class="text-[10px] opacity-50">${p.areaType}</p>` : ''}
    ${p.areaServed && p.areaServed !== p.company ? `<p class="text-[9px] opacity-40">Area: ${p.areaServed}</p>` : ''}
  </div>`;
}

function popupWINEPOverflow(p: Record<string, string | number>) {
  const actionColors: Record<string, string> = { INV: '#eab308', MON: '#3b82f6', IMP: '#22c55e', ND: '#a855f7' };
  const actionLabels: Record<string, string> = { INV: 'Investigation', MON: 'Monitoring', IMP: 'Implementation', ND: 'No Deterioration' };
  const ac = String(p.actionType || '');
  const color = actionColors[ac] || '#9ca3af';
  const label = actionLabels[ac] || ac;
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${color}"></span>
      <span class="font-bold text-xs">${p.siteName || 'WINEP Overflow'}</span>
    </div>
    <p class="text-[10px]"><span class="font-semibold" style="color:${color}">${label}</span> <span class="opacity-50">(${p.certainty || ''})</span></p>
    <p class="text-[10px] opacity-70">${p.company || ''}</p>
    ${p.waterBody ? `<p class="text-[10px] opacity-60">Water body: ${p.waterBody} (${p.waterBodyType || ''})</p>` : ''}
    ${p.coreObligation ? `<p class="text-[10px] opacity-50">${p.rbd || ''} · ${p.coreObligation}</p>` : ''}
    ${p.implementationScope ? `<p class="text-[9px] opacity-40">${String(p.implementationScope).slice(0, 120)}${String(p.implementationScope).length > 120 ? '…' : ''}</p>` : ''}
    ${p.winepId ? `<p class="text-[9px] opacity-40">${p.winepId}</p>` : ''}
  </div>`;
}

function popupEDMOverflow(p: Record<string, string | number>) {
  const spills = Number(p.countedSpills) || 0;
  const hrs = Number(p.totalDurationHrs) || 0;
  const spillColor = spills === 0 ? '#22c55e' : spills < 10 ? '#eab308' : spills < 40 ? '#f97316' : spills < 100 ? '#ef4444' : '#991b1b';
  const hrsStr = hrs > 0 ? `${hrs.toLocaleString('en-GB', { maximumFractionDigits: 1 })} hrs` : '0 hrs';
  const edmPct = Number(p.edmOperationPct) || 0;
  return `<div class="space-y-1">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" style="background:${spillColor}"></span>
      <span class="font-bold text-xs">${p.siteName || 'Storm Overflow'}</span>
    </div>
    <p class="text-[10px]"><span class="font-semibold" style="color:${spillColor}">${spills} spills</span> <span class="opacity-50">(${hrsStr})</span></p>
    <p class="text-[10px] opacity-70">${p.company || ''}</p>
    ${p.receivingWater ? `<p class="text-[10px] opacity-60">Receiving: ${p.receivingWater}</p>` : ''}
    ${p.localAuthority ? `<p class="text-[10px] opacity-50">${p.localAuthority}${p.constituency ? ` · ${p.constituency}` : ''}</p>` : ''}
    ${edmPct ? `<p class="text-[9px] opacity-40">EDM operational: ${edmPct}%</p>` : ''}
    ${p.permitRef ? `<p class="text-[9px] opacity-40">${p.permitRef}</p>` : ''}
  </div>`;
}

/** Get approximate coordinates for a flood warning */
function getWarningCoords(w: FloodWarning): [number, number] {
  const id = w.floodAreaID || w['@id'] || '';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  const lon = -5.5 + (Math.abs(hash % 7300) / 7300) * 7.3;
  const lat = 50 + (Math.abs((hash >> 13) % 6000) / 6000) * 6;
  return [lon, lat];
}

function truncate(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function formatTime(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}
