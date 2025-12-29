/**
 * Location and map related types
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Region extends Coordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface UserLocation extends Coordinates {
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface MapMarker {
  id: number;
  type: 'church' | 'event';
  coordinate: Coordinates;
  title: string;
  description?: string;
}
