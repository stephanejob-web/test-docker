/**
 * React Query hook for denominations
 */

import { useQuery } from '@tanstack/react-query';
import { fetchDenominations } from '@/services/mapService';

/**
 * Hook to fetch all denominations (for filters)
 * Long cache time since denominations rarely change
 */
export function useDenominations() {
  return useQuery({
    queryKey: ['denominations'],
    queryFn: fetchDenominations,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep for 7 days
  });
}
