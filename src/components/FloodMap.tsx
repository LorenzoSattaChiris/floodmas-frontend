import { useRef, useEffect, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MAP_STYLE, MAP_INITIAL_VIEW, WMS_LAYERS } from '../config/layers';
import { useLayerStore } from '../stores/layerStore';
import { useMapRef } from '../context/MapContext';
import {
  useFloodWarnings,
  useWaterLevelStations,
  useRainfallStations,
  useLatestReadings,
  usePrecipitationGrid,
  useFloodDefences,
  useHistoricFloods,
} from '../hooks/useFloodData';
import type {
  FloodWarning,
  Station,
  Reading,
  PrecipitationPoint,
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

// ─── Component ───────────────────────────────────────────────────────
export default function FloodMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useMapRef();
  const [mapLoaded, setMapLoaded] = useState(false);
  const visibleLayers = useLayerStore((s) => s.visibleLayers);

  const { data: floods } = useFloodWarnings();
  const { data: levelStations } = useWaterLevelStations();
  const { data: rainStations } = useRainfallStations();
  const { data: latestReadings } = useLatestReadings();
  const { data: precipGrid } = usePrecipitationGrid();
  const { data: defences } = useFloodDefences();
  const { data: historicFloods } = useHistoricFloods();

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

      // ─ 1. WMS Risk Rasters ─
      addWMSLayer(map, 'risk-rivers-sea', WMS_LAYERS.riskRiversSea);
      addWMSLayer(map, 'risk-surface-water', WMS_LAYERS.riskSurfaceWater);

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
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 5, 10, 10],
          'circle-color': '#14b8a6',
          'circle-opacity': 0.7,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.4)',
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
      addPopupHandler(map, 'historic-floods-fill', popupHistoricFlood);
      addPopupHandler(map, 'flood-defences-line', popupDefence);

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

  // ─── Sync layer visibility ────────────────────────────────────
  const syncVisibility = useCallback(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map) return;

    const layerMapping: Record<string, string[]> = {
      'flood-warnings': ['flood-warnings-circles', 'flood-warnings-pulse'],
      'water-level-stations': ['water-level-stations-circles'],
      'rainfall-stations': ['rainfall-stations-circles'],
      'precipitation': ['precipitation-circles', 'precipitation-halo'],
      'river-discharge': ['river-discharge-circles'],
      'risk-rivers-sea': ['risk-rivers-sea-wms'],
      'risk-surface-water': ['risk-surface-water-wms'],
      'flood-defences': ['flood-defences-line', 'flood-defences-fill'],
      'historic-floods': ['historic-floods-fill', 'historic-floods-outline'],
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

  return <div ref={mapContainer} className="w-full h-full pointer-events-auto" />;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function setSourceData(map: maplibregl.Map, sourceId: string, features: any[]) {
  const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
  if (src) src.setData({ type: 'FeatureCollection', features });
}

function addWMSLayer(map: maplibregl.Map, id: string, config: { url: string; layers: string }) {
  map.addSource(`${id}-wms`, {
    type: 'raster',
    tiles: [
      `${config.url}?service=WMS&version=1.3.0&request=GetMap&layers=${config.layers}&styles=&crs=EPSG:3857&bbox={bbox-epsg-3857}&width=256&height=256&format=image/png&transparent=true`,
    ],
    tileSize: 256,
  });
  map.addLayer({
    id: `${id}-wms`,
    type: 'raster',
    source: `${id}-wms`,
    paint: { 'raster-opacity': 0.6 },
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
