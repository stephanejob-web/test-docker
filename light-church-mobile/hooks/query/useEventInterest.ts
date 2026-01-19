/**
 * Hooks pour gérer les intérêts sur les événements
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { getDeviceId } from '@/services/pushNotificationService';

interface EventInterestResponse {
  success: boolean;
  message?: string;
  interested_count: number;
  is_interested?: boolean;
  removed?: boolean;
}

/**
 * Hook pour vérifier si l'utilisateur est intéressé par un événement
 */
export function useIsInterested(eventId: number) {
  return useQuery({
    queryKey: ['event-interest', eventId],
    queryFn: async () => {
      const deviceId = await getDeviceId();
      if (!deviceId) {
        return { is_interested: false };
      }

      const response = await api.get<EventInterestResponse>(
        `/public/events/${eventId}/is-interested`,
        { params: { device_id: deviceId } }
      );

      return response.data;
    },
    enabled: !!eventId,
  });
}

/**
 * Hook pour obtenir le nombre de personnes intéressées
 */
export function useInterestedCount(eventId: number) {
  return useQuery({
    queryKey: ['event-interest-count', eventId],
    queryFn: async () => {
      const response = await api.get<EventInterestResponse>(
        `/public/events/${eventId}/interested-count`
      );
      return response.data;
    },
    enabled: !!eventId,
  });
}

/**
 * Hook pour enregistrer/retirer son intérêt pour un événement
 */
export function useToggleEventInterest(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isCurrentlyInterested: boolean) => {
      const deviceId = await getDeviceId();
      if (!deviceId) {
        throw new Error('Device ID not found. Please enable notifications first.');
      }

      let response;
      if (isCurrentlyInterested) {
        // DELETE requires device_id in query params (not body)
        response = await api.delete<EventInterestResponse>(
          `/public/events/${eventId}/interest`,
          { params: { device_id: deviceId } }
        );
      } else {
        // POST sends data directly
        response = await api.post<EventInterestResponse>(
          `/public/events/${eventId}/interest`,
          { device_id: deviceId }
        );
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['event-interest', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-interest-count', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-detail', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // IMPORTANT: Invalider aussi interestedEvents pour mettre à jour l'onglet "Enregistrés"
      queryClient.invalidateQueries({ queryKey: ['interestedEvents'] });
      queryClient.invalidateQueries({ queryKey: ['interestedEventsCount'] }); // Update badge
    },
  });
}
