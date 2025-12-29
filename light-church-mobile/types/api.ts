/**
 * API request and response types
 */

import { Church, ChurchDetail } from './church';
import { Event, EventDetail } from './event';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ChurchesResponse {
  success: boolean;
  count: number;
  hasMore?: boolean;
  churches: Church[];
}

export interface EventsResponse {
  success: boolean;
  count: number;
  hasMore?: boolean;
  events: Event[];
}

export interface ChurchDetailResponse {
  success: boolean;
  church: ChurchDetail;
}

export interface EventDetailResponse {
  success: boolean;
  event: EventDetail;
}

export interface StatsResponse {
  success: boolean;
  stats: {
    churches: number;
    ongoingEvents: number;
    upcomingEvents: number;
  };
}

export interface ChurchesQueryParams {
  // Bounding box mode
  north?: number;
  south?: number;
  east?: number;
  west?: number;

  // Radius mode
  latitude?: number;
  longitude?: number;
  radius?: number;

  // User location for distance calculation
  userLat?: number;
  userLng?: number;

  // Filters
  denomination_id?: number;
  search?: string;
  limit?: number;
}

export interface EventsQueryParams {
  // Bounding box mode
  north?: number;
  south?: number;
  east?: number;
  west?: number;

  // Radius mode
  latitude?: number;
  longitude?: number;
  radius?: number;

  // User location for distance calculation
  userLat?: number;
  userLng?: number;

  // Filters
  search?: string;
  limit?: number;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
