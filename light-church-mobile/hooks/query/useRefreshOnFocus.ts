/**
 * Custom hook to refetch queries when screen comes into focus
 * Based on TanStack Query React Native documentation
 */

import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native'; // or use expo-router's useFocusEffect
import { useQueryClient } from '@tanstack/react-query';

export function useRefreshOnFocus() {
  const queryClient = useQueryClient();
  const firstTimeRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // Skip refetch on first mount
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      // Refetch all stale active queries when screen comes into focus
      queryClient.refetchQueries({
        type: 'active',
        stale: true,
      });
    }, [queryClient])
  );
}
