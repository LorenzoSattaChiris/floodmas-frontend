import { useQuery } from '@tanstack/react-query';
import {
  fetchFloodWarnings,
  fetchStations,
  fetchStationReadings,
  fetchLatestReadings,
  fetchPrecipitationGrid,
  fetchRiverDischarge,
  fetchRiverDischargeGrid,
  fetchSoilMoistureGrid,
  fetchFloodDefences,
  fetchHistoricFloods,
  fetchMainRivers,
  fetchTideGaugeStations,
  fetchGroundwaterStations,
  fetchNRFAStations,
  fetchFloodWarningAreas,
  fetchExtendedWeatherGrid,
  fetchFloodFeed,
  fetchHealth,
  fetchMetOfficeForecast,
  fetchCDSReanalysis,
  fetchFloodRiskAreas,
  fetchPostcodeRisk,
  fetchPropertyRiskSummary,
  fetchLLFABoundaries,
  fetchIMDBoundaries,
  fetchRiskLayerFeatures,
  type FloodsResponse,
  type StationsResponse,
  type ReadingsResponse,
  type PrecipitationGrid,
  type RiverDischargeData,
  type SoilMoistureGrid,
  type FeatureCollection,
  type NRFAStationsResponse,
  type FloodAreasResponse,
  type ExtendedWeatherGrid,
  type FeedResponse,
  type HealthResponse,
  type MetOfficeForecastGrid,
  type CDSReanalysisGrid,
  type FloodRiskAreasGeoJSON,
  type PostcodeRisk,
  type PropertyRiskSummary,
  type LLFAGeoJSON,
  type IMDGeoJSON,
} from '../services/api';

export function useFloodWarnings() {
  return useQuery<FloodsResponse>({
    queryKey: ['floods'],
    queryFn: fetchFloodWarnings,
    refetchInterval: 5 * 60_000, // 5 min
  });
}

export function useWaterLevelStations() {
  return useQuery<StationsResponse>({
    queryKey: ['stations', 'level'],
    queryFn: () => fetchStations({ parameter: 'level', _limit: '500' }),
    refetchInterval: 15 * 60_000, // 15 min
  });
}

export function useRainfallStations() {
  return useQuery<StationsResponse>({
    queryKey: ['stations', 'rainfall'],
    queryFn: () => fetchStations({ parameter: 'rainfall', _limit: '500' }),
    refetchInterval: 15 * 60_000,
  });
}

export function useLatestReadings() {
  return useQuery<ReadingsResponse>({
    queryKey: ['readings', 'latest'],
    queryFn: fetchLatestReadings,
    refetchInterval: 5 * 60_000,
  });
}

export function useStationReadings(stationId: string | null) {
  return useQuery<ReadingsResponse>({
    queryKey: ['readings', stationId],
    queryFn: () => fetchStationReadings(stationId!),
    enabled: !!stationId,
    refetchInterval: 5 * 60_000,
  });
}

export function usePrecipitationGrid() {
  return useQuery<PrecipitationGrid>({
    queryKey: ['weather', 'precipitation'],
    queryFn: fetchPrecipitationGrid,
    refetchInterval: 30 * 60_000, // 30 min
  });
}

export function useRiverDischargeGrid() {
  return useQuery<RiverDischargeData>({
    queryKey: ['weather', 'river-discharge-grid'],
    queryFn: fetchRiverDischargeGrid,
    refetchInterval: 30 * 60_000,
    staleTime: 15 * 60_000,
  });
}

export function useSoilMoistureGrid() {
  return useQuery<SoilMoistureGrid>({
    queryKey: ['weather', 'soil-moisture'],
    queryFn: fetchSoilMoistureGrid,
    refetchInterval: 60 * 60_000, // 1 hour — soil moisture changes slowly
    staleTime: 30 * 60_000,
  });
}

export function useTideGaugeStations() {
  return useQuery<StationsResponse>({
    queryKey: ['stations', 'tidal'],
    queryFn: fetchTideGaugeStations,
    refetchInterval: 15 * 60_000,
  });
}

export function useMainRivers() {
  return useQuery<FeatureCollection>({
    queryKey: ['features', 'main-rivers'],
    queryFn: () => fetchMainRivers(),
    refetchInterval: 60 * 60_000,
    staleTime: 30 * 60_000,
  });
}

export function useRiverDischarge(coords: Array<{ lat: number; lon: number }>) {
  return useQuery<RiverDischargeData>({
    queryKey: ['weather', 'river-discharge', coords.length],
    queryFn: () => fetchRiverDischarge(coords),
    enabled: coords.length > 0,
    refetchInterval: 30 * 60_000,
  });
}

export function useFloodDefences() {
  return useQuery<FeatureCollection>({
    queryKey: ['features', 'defences'],
    queryFn: () => fetchFloodDefences(),
    refetchInterval: 60 * 60_000, // 1 hour
    staleTime: 30 * 60_000,
  });
}

export function useHistoricFloods() {
  return useQuery<FeatureCollection>({
    queryKey: ['features', 'historic-floods'],
    queryFn: () => fetchHistoricFloods(),
    refetchInterval: 60 * 60_000,
    staleTime: 30 * 60_000,
  });
}

export function useGroundwaterStations() {
  return useQuery<StationsResponse>({
    queryKey: ['stations', 'groundwater'],
    queryFn: fetchGroundwaterStations,
    refetchInterval: 15 * 60_000,
  });
}

export function useNRFAStations() {
  return useQuery<NRFAStationsResponse>({
    queryKey: ['nrfa', 'stations'],
    queryFn: fetchNRFAStations,
    refetchInterval: 60 * 60_000, // 1 hour — static stations
    staleTime: 30 * 60_000,
  });
}

export function useFloodWarningAreas() {
  return useQuery<FloodAreasResponse>({
    queryKey: ['flood-areas', 'warning'],
    queryFn: fetchFloodWarningAreas,
    refetchInterval: 60 * 60_000,
    staleTime: 30 * 60_000,
  });
}

export function useExtendedWeather() {
  return useQuery<ExtendedWeatherGrid>({
    queryKey: ['weather', 'extended'],
    queryFn: fetchExtendedWeatherGrid,
    refetchInterval: 30 * 60_000,
    staleTime: 15 * 60_000,
  });
}

export function useFloodFeed(mode: 'focused' | 'broad' = 'focused') {
  const limit = mode === 'broad' ? 60 : 25;
  return useQuery<FeedResponse>({
    queryKey: ['feed', mode],
    queryFn: () => fetchFloodFeed(limit, mode),
    refetchInterval: 2 * 60_000, // 2 min
    staleTime: 60_000,
  });
}

export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
  });
}

export function useMetOfficeForecast() {
  return useQuery<MetOfficeForecastGrid>({
    queryKey: ['metoffice', 'forecast'],
    queryFn: fetchMetOfficeForecast,
    refetchInterval: 30 * 60_000, // 30 min
    staleTime: 15 * 60_000,
  });
}

export function useCDSReanalysis() {
  return useQuery<CDSReanalysisGrid>({
    queryKey: ['cds', 'reanalysis'],
    queryFn: fetchCDSReanalysis,
    refetchInterval: 60 * 60_000, // 1 hour — ERA5-Land has ~5 day latency
    staleTime: 30 * 60_000,
  });
}

export function useFloodRiskAreas() {
  return useQuery<FloodRiskAreasGeoJSON>({
    queryKey: ['datasets', 'flood-risk-areas'],
    queryFn: fetchFloodRiskAreas,
    refetchInterval: false, // Static dataset — no refetch needed
    staleTime: Infinity,
  });
}

export function usePostcodeRisk(postcode: string | null) {
  return useQuery<PostcodeRisk>({
    queryKey: ['datasets', 'postcode-risk', postcode],
    queryFn: () => fetchPostcodeRisk(postcode!),
    enabled: !!postcode && postcode.length >= 3,
    staleTime: Infinity,
  });
}

export function usePropertyRiskSummary() {
  return useQuery<PropertyRiskSummary>({
    queryKey: ['datasets', 'property-risk-summary'],
    queryFn: fetchPropertyRiskSummary,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useLLFABoundaries() {
  return useQuery<LLFAGeoJSON>({
    queryKey: ['llfa', 'boundaries'],
    queryFn: fetchLLFABoundaries,
    refetchInterval: false, // Static dataset
    staleTime: Infinity,
  });
}

/**
 * Fetch LSOA boundaries enriched with IMD 2019 deprivation scores for a map bbox.
 * bbox string: "minLon,minLat,maxLon,maxLat"
 * Results are cached indefinitely — LSOA boundaries and IMD scores don't change.
 */
export function useIMDBoundaries(bbox: string | null) {
  return useQuery<IMDGeoJSON>({
    queryKey: ['imd', 'boundaries', bbox],
    queryFn: () => fetchIMDBoundaries(bbox!),
    enabled: !!bbox,
    staleTime: Infinity, // LSOA boundaries + IMD scores are static
    refetchInterval: false,
  });
}

/**
 * Fetch risk layer polygons from EA FeatureServer.
 * Queries only when a bbox is supplied (zoom >= 8) and the layer is visible.
 */
export function useRiskLayerFeatures(layer: string, bbox: string | null, enabled: boolean) {
  return useQuery<FeatureCollection>({
    queryKey: ['risk', layer, bbox],
    queryFn: () => fetchRiskLayerFeatures(layer, bbox ?? undefined),
    enabled: enabled && !!bbox,
    staleTime: 5 * 60_000,
    refetchInterval: false,
  });
}
