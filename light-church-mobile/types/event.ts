/**
 * Event related types
 */

import type { ChurchDetail } from './church';

export interface Event {
  id: number;
  title: string;
  start_datetime: string;
  end_datetime: string;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  church_name?: string;
  church_id?: number;
  event_address?: string;
  event_city?: string;
  city?: string; // Alias for event_city (used in some components)
  event_postal_code?: string;
  distance_km?: number;
  interested_count?: number;
  // Champs d'annulation
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  cancelled_by?: number | null;
}

export interface EventDetail extends Event {
  denomination_id?: number;
  denomination_name?: string;
  organizer_name?: string;
  pastor_first_name?: string;
  pastor_last_name?: string;
  pastor_email?: string;
  primary_language_code?: string;
  primary_language_name?: string;
  primary_language_flag?: string;
  interested_count?: number;
  details: {
    event_id: number;
    description?: string;
    max_seats?: number;
    image_url?: string;
    address?: string;
    street_number?: string;
    street_name?: string;
    postal_code?: string;
    city?: string;
    speaker_name?: string;
    has_parking: number;
    parking_capacity?: number;
    is_parking_free: number;
    parking_details?: string;
    is_free: number;
    registration_link?: string;
    youtube_live?: string;
  };
  primary_language?: {
    code: string;
    name: string;
    flag: string;
  };
  translations?: EventTranslation[];
  church?: ChurchDetail;
}

export interface EventTranslation {
  language_id: number;
  language_code: string;
  language_name: string;
  language_flag?: string;
}

export interface Language {
  id: number;
  code: string;
  name_native: string;
  name_fr: string;
  flag_emoji?: string;
}

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
