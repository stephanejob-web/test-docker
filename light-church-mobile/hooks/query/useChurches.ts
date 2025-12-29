/**
 * React Query hooks for churches
 */

import { useQuery } from '@tanstack/react-query';
import { fetchChurches, fetchChurchDetail } from '@/services/mapService';
import type { ChurchesQueryParams } from '@/types';

/**
 * Hook to fetch churches based on map viewport or radius
 */
export function useChurches(params: ChurchesQueryParams, enabled = true) {
  return useQuery({
    queryKey: ['churches', params],
    queryFn: () => fetchChurches(params),
    enabled: enabled && (
      // Ensure we have either bounding box or lat/lng
      !!(params.north && params.south && params.east && params.west) ||
      !!(params.latitude && params.longitude)
    ),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch single church details
 */
export function useChurchDetail(id: number, enabled = true) {
  return useQuery({
    queryKey: ['church', id],
    queryFn: () => fetchChurchDetail(id),
    enabled: enabled && id > 0,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
