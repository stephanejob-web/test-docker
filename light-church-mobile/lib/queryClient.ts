/**
 * React Query configuration
 */

import { QueryClient } from '@tanstack/react-query';
import { CACHE_CONFIG } from '@/constants/config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: CACHE_CONFIG.STALE_TIME,
      gcTime: CACHE_CONFIG.CACHE_TIME, // v5 uses gcTime instead of cacheTime

      // Refetch configuration - Optimized for mobile performance
      refetchOnMount: false, // Don't refetch if data is still fresh (use staleTime)
      refetchOnWindowFocus: false, // Mobile doesn't have window focus
      refetchOnReconnect: true, // Refetch when connection restored

      // Retry configuration - Enhanced for better error recovery
      retry: 3, // Increased from 2 to 3 for better resilience
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

      // Performance
      refetchInterval: false, // No polling to save battery

      // Network mode - show cached data while fetching
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});
