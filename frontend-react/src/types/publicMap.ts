/**
 * Types pour l'API publique de la carte
 */

export interface Church {
    id: number;
    church_name: string;
    longitude: number;
    latitude: number;
    denomination_name: string | null;
    city: string | null;
    postal_code: string | null;
    address: string | null;
    logo_url: string | null;
    pastor_name: string;
    distance_km: number | null;
}

export interface ChurchDetails extends Church {
    details: {
        phone?: string;
        website?: string;
        description?: string;
        parking_info?: string;
        parking_capacity?: number;
    };
    schedules: ChurchSchedule[];
    socials: ChurchSocial[];
}

export interface ChurchSchedule {
    id: number;
    day_of_week: string;
    start_time: string;
    activity_type: string | null;
}

export interface ChurchSocial {
    platform: string;
    url: string;
}

export interface Event {
    id: number;
    title: string;
    start_datetime: string;
    end_datetime: string | null;
    longitude: number;
    latitude: number;
    church_name: string;
    church_id: number;
    event_address: string | null;
    event_city: string | null;
    distance_km: number | null;
}

export interface EventDetails extends Event {
    organizer_name: string;
    details: {
        description?: string;
        address?: string;
        city?: string;
        postal_code?: string;
    };
}

export interface Denomination {
    id: number;
    name: string;
}

export interface MapFilters {
    radius: number;
    denominationId: number | null;
    showChurches: boolean;
    showEvents: boolean;
    search: string;
}

export interface UserLocation {
    latitude: number;
    longitude: number;
}

export interface ApiResponse<T> {
    success: boolean;
    count?: number;
    message?: string;
    churches?: T extends Church[] ? T : never;
    events?: T extends Event[] ? T : never;
    denominations?: T extends Denomination[] ? T : never;
    church?: T extends ChurchDetails ? T : never;
    event?: T extends EventDetails ? T : never;
}
