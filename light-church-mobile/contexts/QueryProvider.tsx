/**
 * React Query Provider with React Native setup
 */

import React, { useEffect } from 'react';
import { AppState, Platform, AppStateStatus } from 'react-native';
import { QueryClientProvider, onlineManager, focusManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { queryClient } from '@/lib/queryClient';

// Configure onlineManager for React Native
onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected);
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
});

// Configure focusManager for React Native
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    // Setup AppState listener for focus management
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
