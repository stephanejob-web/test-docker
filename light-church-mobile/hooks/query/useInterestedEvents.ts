/**
 * React Query Hook for Interested Events
 * Fetches all events where user clicked "Ça m'intéresse"
 *
 * OPTIMIZATIONS:
 * - 5min stale time (balance between freshness & network)
 * - Cache persistence
 * - Optimistic updates support
 * - Automatic refetch on focus
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { getDeviceId } from '@/services/pushNotificationService';
import type { Event } from '@/types';

interface InterestedEventsResponse {
  success: boolean;
  count: number;
  events: Event[];
}

/**
 * Fetch interested events for current device
 */
async function fetchInterestedEvents(): Promise<Event[]> {
  const deviceId = await getDeviceId();

  if (!deviceId) {
    return [];
  }

  const { data } = await api.get<InterestedEventsResponse>('/public/events/interested', {
    params: {
      device_id: deviceId,
      limit: 50,
    },
  });

  return data.events || [];
}

/**
 * Hook: Fetch interested events
 * Returns list of events with React Query optimizations
 */
export function useInterestedEvents() {
  return useQuery({
    queryKey: ['interestedEvents'],
    queryFn: fetchInterestedEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes - balance between freshness & performance
    gcTime: 30 * 60 * 1000, // 30 minutes cache retention
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when user returns to app
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}

/**
 * Hook: Remove interest from event (optimistic update)
 * Immediately updates UI, then syncs with server
 */
export function useRemoveInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      const deviceId = await getDeviceId();

      if (!deviceId) {
        throw new Error('Device ID not found');
      }

      await api.delete(`/public/events/${eventId}/interest`, {
        params: { device_id: deviceId },
      });

      return eventId;
    },
    // Optimistic update: Remove from UI immediately
    onMutate: async (eventId) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['interestedEvents'] });

      // Snapshot previous value
      const previousEvents = queryClient.getQueryData<Event[]>(['interestedEvents']);

      // Optimistically update cache
      queryClient.setQueryData<Event[]>(['interestedEvents'], (old) => {
        return old?.filter((event) => event.id !== eventId) || [];
      });

      // Return context for rollback
      return { previousEvents };
    },
    // Rollback on error
    onError: (_err, _eventId, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['interestedEvents'], context.previousEvents);
      }
    },
    // Always refetch after mutation (success or error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['interestedEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] }); // Update main list
      queryClient.invalidateQueries({ queryKey: ['event'] }); // Update detail screens
    },
  });
}
