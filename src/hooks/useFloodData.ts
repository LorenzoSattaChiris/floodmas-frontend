import { useQuery } from '@tanstack/react-query';
import {
  fetchFloodWarnings,
  fetchStations,
  fetchStationReadings,
  fetchLatestReadings,
  fetchPrecipitationGrid,
  fetchRiverDischarge,
  fetchFloodDefences,
  fetchHistoricFloods,
  fetchFloodFeed,
  fetchHealth,
  type FloodsResponse,
  type StationsResponse,
  type ReadingsResponse,
  type PrecipitationGrid,
  type RiverDischargeData,
  type FeatureCollection,
  type FeedResponse,
  type HealthResponse,
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
