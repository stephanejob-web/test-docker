/**
 * Church related types
 */

export interface Church {
  id: number;
  church_name: string;
  latitude: number;
  longitude: number;
  denomination_name: string;
  denomination_id: number;
  pastor_name?: string;
  city: string;
  postal_code: string;
  distance_km?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChurchDetail extends Church {
  first_name?: string;
  last_name?: string;
  email?: string;
  details: {
    church_id: number;
    status: string;
    language_id: number;
    pastor_first_name?: string;
    pastor_last_name?: string;
    logo_url?: string;
    address?: string;
    street_number?: string;
    street_name?: string;
    postal_code: string;
    city: string;
    phone?: string;
    description?: string;
    website?: string;
    has_parking: number;
    parking_capacity?: number;
    is_parking_free: number;
  };
  schedules: ChurchSchedule[];
  socials: ChurchSocial[];
}

export interface ChurchSchedule {
  id: number;
  day_of_week: string;
  start_time: string;
  activity_type: string;
  activity_type_id?: number;
}

export interface ChurchSocial {
  id: number;
  platform: SocialPlatform;
  url: string;
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type SocialPlatform =
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'WHATSAPP'
  | 'LINKEDIN';

export interface Denomination {
  id: number;
  name: string;
  abbreviation?: string;
  is_active: boolean;
}
