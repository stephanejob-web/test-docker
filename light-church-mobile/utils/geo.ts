/**
 * Geographic utilities
 */

import type { Region, BoundingBox, Coordinates } from '@/types';

/**
 * Calculate bounding box from map region
 */
export function getBoundingBox(region: Region): BoundingBox {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

  return {
    north: latitude + latitudeDelta / 2,
    south: latitude - latitudeDelta / 2,
    east: longitude + longitudeDelta / 2,
    west: longitude - longitudeDelta / 2,
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
