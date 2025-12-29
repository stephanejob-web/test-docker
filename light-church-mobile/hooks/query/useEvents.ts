/**
 * React Query hooks for events
 */

import { useQuery } from '@tanstack/react-query';
import { fetchEvents, fetchEventDetail } from '@/services/mapService';
import type { EventsQueryParams } from '@/types';

/**
 * Hook to fetch events based on map viewport or radius
 */
export function useEvents(params: EventsQueryParams, enabled = true) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
    enabled: enabled && (
      // Ensure we have either bounding box or lat/lng
      !!(params.north && params.south && params.east && params.west) ||
      !!(params.latitude && params.longitude)
    ),
    staleTime: 30 * 60 * 1000, // 30 minutes (events change more frequently)
  });
}

/**
 * Hook to fetch single event details
 */
export function useEventDetail(id: number, enabled = true) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEventDetail(id),
    enabled: enabled && id > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
