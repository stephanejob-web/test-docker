/**
 * Map service - Handles churches and events API calls
 */

import api from '@/lib/axios';
import type {
  ChurchesQueryParams,
  ChurchesResponse,
  ChurchDetailResponse,
  EventsQueryParams,
  EventsResponse,
  EventDetailResponse,
  Denomination,
  StatsResponse,
} from '@/types';

/**
 * Fetch churches based on bounding box or radius
 */
export const fetchChurches = async (
  params: ChurchesQueryParams
): Promise<ChurchesResponse> => {
  const response = await api.get<ChurchesResponse>('/public/churches', {
    params,
  });
  return response.data;
};

/**
 * Fetch single church details
 */
export const fetchChurchDetail = async (
  id: number
): Promise<ChurchDetailResponse> => {
  const response = await api.get<ChurchDetailResponse>(`/public/churches/${id}`);
  return response.data;
};

/**
 * Fetch events based on bounding box or radius
 */
export const fetchEvents = async (
  params: EventsQueryParams
): Promise<EventsResponse> => {
  const response = await api.get<EventsResponse>('/public/events', {
    params,
  });
  return response.data;
};

/**
 * Fetch single event details
 */
export const fetchEventDetail = async (
  id: number
): Promise<EventDetailResponse> => {
  const response = await api.get<EventDetailResponse>(`/public/events/${id}`);
  return response.data;
};

/**
 * Fetch all denominations for filters
 */
export const fetchDenominations = async (): Promise<Denomination[]> => {
  const response = await api.get<{ success: boolean; denominations: Denomination[] }>(
    '/public/denominations'
  );
  return response.data.denominations || [];
};

/**
 * Fetch global statistics
 */
export const fetchStats = async (): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>('/public/stats');
  return response.data;
};
