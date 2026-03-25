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
  fetchWFDCatchments,
  fetchNFMHotspots,
  fetchStormOverflows,
  fetchSchools,
  fetchHospitals,
  fetchBathingWaters,
  fetchRamsar,
  fetchWaterCompanyBoundaries,
  fetchEDMOverflows,
  fetchWINEPOverflows,
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
  type WFDCatchmentsGeoJSON,
  type NFMHotspotsGeoJSON,
  type StormOverflowData,
  type SchoolsGeoJSON,
  type HospitalsGeoJSON,
  type BathingWatersGeoJSON,
  type RamsarGeoJSON,
  type WaterCompanyBoundariesGeoJSON,
  type EDMOverflowsGeoJSON,
  type WINEPOverflowsGeoJSON,
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

export function useRainfallStations(enabled = true) {
  return useQuery<StationsResponse>({
    queryKey: ['stations', 'rainfall'],
    queryFn: () => fetchStations({ parameter: 'rainfall', _limit: '500' }),
    enabled,
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

export function useRiverDischargeGrid(enabled = true) {
  return useQuery<RiverDischargeData>({
    queryKey: ['weather', 'river-discharge-grid'],
    queryFn: fetchRiverDischargeGrid,
    enabled,
    refetchInterval: 30 * 60_000,
    staleTime: 15 * 60_000,
  });
}

export function useSoilMoistureGrid(enabled = true) {
  return useQuery<SoilMoistureGrid>({
    queryKey: ['weather', 'soil-moisture'],
    queryFn: fetchSoilMoistureGrid,
    enabled,
    refetchInterval: 60 * 60_000, // 1 hour — soil moisture changes slowly
    staleTime: 30 * 60_000,
  });
}

export function useTideGaugeStations(enabled = true) {
  return useQuery<StationsResponse>({
    queryKey: ['stations', 'tidal'],
    queryFn: fetchTideGaugeStations,
    enabled,
    refetchInterval: 15 * 60_000,
  });
}

export function useMainRivers(enabled = true) {
  return useQuery<FeatureCollection>({
    queryKey: ['features', 'main-rivers'],
    queryFn: () => fetchMainRivers(),
    enabled,
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

export function useFloodDefences(enabled = true) {
  return useQuery<FeatureCollection>({
    queryKey: ['features', 'defences'],
    queryFn: () => fetchFloodDefences(),
    enabled,
    refetchInterval: 60 * 60_000, // 1 hour
    staleTime: 30 * 60_000,
  });
}

export function useHistoricFloods(enabled = true) {
  return useQuery<FeatureCollection>({
    queryKey: ['features', 'historic-floods'],
    queryFn: () => fetchHistoricFloods(),
    enabled,
    refetchInterval: 60 * 60_000,
    staleTime: 30 * 60_000,
  });
}

export function useGroundwaterStations(enabled = true) {
  return useQuery<StationsResponse>({
    queryKey: ['stations', 'groundwater'],
    queryFn: fetchGroundwaterStations,
    enabled,
    refetchInterval: 15 * 60_000,
  });
}

export function useNRFAStations(enabled = true) {
  return useQuery<NRFAStationsResponse>({
    queryKey: ['nrfa', 'stations'],
    queryFn: fetchNRFAStations,
    enabled,
    refetchInterval: 60 * 60_000, // 1 hour — static stations
    staleTime: 30 * 60_000,
  });
}

export function useFloodWarningAreas(enabled = true) {
  return useQuery<FloodAreasResponse>({
    queryKey: ['flood-areas', 'warning'],
    queryFn: fetchFloodWarningAreas,
    enabled,
    refetchInterval: 60 * 60_000,
    staleTime: 30 * 60_000,
  });
}

export function useExtendedWeather(enabled = true) {
  return useQuery<ExtendedWeatherGrid>({
    queryKey: ['weather', 'extended'],
    queryFn: fetchExtendedWeatherGrid,
    enabled,
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
    // Poll quickly while datasets are still loading, then back off to 30s
    refetchInterval: (query) =>
      (query.state.data as HealthResponse | undefined)?.datasetsReady === false ? 5_000 : 30_000,
  });
}

export function useMetOfficeForecast(enabled = true) {
  return useQuery<MetOfficeForecastGrid>({
    queryKey: ['metoffice', 'forecast'],
    queryFn: fetchMetOfficeForecast,
    enabled,
    refetchInterval: 30 * 60_000, // 30 min
    staleTime: 15 * 60_000,
  });
}

export function useCDSReanalysis(enabled = true) {
  return useQuery<CDSReanalysisGrid>({
    queryKey: ['cds', 'reanalysis'],
    queryFn: fetchCDSReanalysis,
    enabled,
    refetchInterval: 60 * 60_000, // 1 hour — ERA5-Land has ~5 day latency
    staleTime: 30 * 60_000,
  });
}

export function useFloodRiskAreas(enabled = true) {
  return useQuery<FloodRiskAreasGeoJSON>({
    queryKey: ['datasets', 'flood-risk-areas'],
    queryFn: fetchFloodRiskAreas,
    enabled,
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

export function useLLFABoundaries(enabled = true) {
  return useQuery<LLFAGeoJSON>({
    queryKey: ['llfa', 'boundaries'],
    queryFn: fetchLLFABoundaries,
    enabled,
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

export function useWFDCatchments(enabled = true) {
  return useQuery<WFDCatchmentsGeoJSON>({
    queryKey: ['datasets', 'wfd-catchments'],
    queryFn: fetchWFDCatchments,
    enabled,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useNFMHotspots(enabled = true) {
  return useQuery<NFMHotspotsGeoJSON>({
    queryKey: ['datasets', 'nfm-hotspots'],
    queryFn: fetchNFMHotspots,
    enabled,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useStormOverflows() {
  return useQuery<StormOverflowData>({
    queryKey: ['datasets', 'storm-overflows'],
    queryFn: fetchStormOverflows,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useSchools(enabled = true) {
  return useQuery<SchoolsGeoJSON>({
    queryKey: ['datasets', 'schools'],
    queryFn: fetchSchools,
    enabled,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useHospitals(enabled = true) {
  return useQuery<HospitalsGeoJSON>({
    queryKey: ['datasets', 'hospitals'],
    queryFn: fetchHospitals,
    enabled,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useBathingWaters(enabled = true) {
  return useQuery<BathingWatersGeoJSON>({
    queryKey: ['datasets', 'bathingWaters'],
    queryFn: fetchBathingWaters,
    enabled,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useRamsar(enabled = true) {
  return useQuery<RamsarGeoJSON>({
    queryKey: ['datasets', 'ramsar'],
    queryFn: fetchRamsar,
    enabled,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useWaterCompanyBoundaries(enabled = true) {
  return useQuery<WaterCompanyBoundariesGeoJSON>({
    queryKey: ['datasets', 'waterCompanyBoundaries'],
    queryFn: fetchWaterCompanyBoundaries,
    enabled,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useEDMOverflows(enabled = true) {
  return useQuery<EDMOverflowsGeoJSON>({
    queryKey: ['datasets', 'edmOverflows'],
    queryFn: fetchEDMOverflows,
    enabled,
    refetchInterval: false,
    staleTime: Infinity,
  });
}

export function useWINEPOverflows(enabled = true) {
  return useQuery<WINEPOverflowsGeoJSON>({
    queryKey: ['datasets', 'winepOverflows'],
    queryFn: fetchWINEPOverflows,
    enabled,
    refetchInterval: false,
    staleTime: Infinity,
  });
}
