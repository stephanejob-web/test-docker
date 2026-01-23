/**
 * Configuration constants for Light Church Mobile
 */

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.10.121:3000/api',
  TIMEOUT: 10000, // 10 seconds
} as const;

export const MAP_CONFIG = {
  DEFAULT_LATITUDE: 46.603354, // France center
  DEFAULT_LONGITUDE: 1.888334,
  DEFAULT_ZOOM: 6,
  DEFAULT_RADIUS_KM: 50, // Search radius in km
  MAX_RADIUS_KM: 1000,
  CLUSTERING_RADIUS: 50, // Cluster radius in pixels
} as const;

export const CACHE_CONFIG = {
  STALE_TIME: 60 * 60 * 1000, // 1 hour
  CACHE_TIME: 24 * 60 * 60 * 1000, // 24 hours
  LOCATION_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
} as const;

export const COLORS = {
  // Google Maps inspired colors
  PRIMARY: '#4285F4',
  SUCCESS: '#34A853',
  WARNING: '#FBBC04',
  ERROR: '#EA4335',

  // Grays
  GRAY_50: '#F8F9FA',
  GRAY_100: '#F1F3F4',
  GRAY_200: '#E8EAED',
  GRAY_300: '#DADCE0',
  GRAY_400: '#BDC1C6',
  GRAY_500: '#9AA0A6',
  GRAY_600: '#80868B',
  GRAY_700: '#5F6368',
  GRAY_800: '#3C4043',
  GRAY_900: '#202124',

  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;
