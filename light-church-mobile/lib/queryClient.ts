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

      // Refetch configuration
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,

      // Retry configuration
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Performance
      refetchInterval: false, // No polling to save battery
    },
    mutations: {
      retry: 1,
    },
  },
});
