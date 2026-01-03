/**
 * Main Map Screen
 * Google Maps style with bottom sheet
 */

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import BottomSheet from '@gorhom/bottom-sheet';
import type { Region } from 'react-native-maps';
import MapView from 'react-native-maps';

import ChurchMap from '@/components/map/ChurchMap';
import ChurchesBottomSheet from '@/components/bottomSheet/ChurchesBottomSheet';
import SearchBar from '@/components/map/SearchBar';
import MyLocationButton from '@/components/map/MyLocationButton';
import RefreshButton from '@/components/map/RefreshButton';
import MapTypeToggle from '@/components/map/MapTypeToggle';
import MapTypeModal from '@/components/map/MapTypeModal';
import { Box, Text } from '@/components/ui';
import { useLocation } from '@/hooks/useLocation';
import { useChurches, useEvents } from '@/hooks/query';
import { getBoundingBox } from '@/utils/geo';
import { MAP_CONFIG } from '@/constants/config';
import type { Church, Event } from '@/types';

export default function MapScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  // User location
  const { location: userLocation, loading: locationLoading } = useLocation();

  // Map region state
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: userLocation?.latitude || MAP_CONFIG.DEFAULT_LATITUDE,
    longitude: userLocation?.longitude || MAP_CONFIG.DEFAULT_LONGITUDE,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  // Filters
  const [showChurches, setShowChurches] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  // Map type (standard, satellite)
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  // Map type modal visibility
  const [showMapTypeModal, setShowMapTypeModal] = useState(false);

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate query params
  const queryParams = useMemo(() => {
    const bbox = getBoundingBox(mapRegion);
    return {
      ...bbox,
      userLat: userLocation?.latitude,
      userLng: userLocation?.longitude,
      limit: 100,
    };
  }, [mapRegion, userLocation]);

  // Fetch data
  const { data: churchesData, isLoading: churchesLoading, refetch: refetchChurches } = useChurches(queryParams, showChurches);
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useEvents(queryParams, showEvents);

  const churches = churchesData?.churches || [];
  const events = eventsData?.events || [];


  // Handle map region change (debounced in hook)
  const handleRegionChange = useCallback((region: Region) => {
    setMapRegion(region);
  }, []);

  // Navigate to details
  const handleChurchPress = useCallback((church: Church) => {
    router.push(`/church/${church.id}`);
  }, [router]);

  const handleEventPress = useCallback((event: Event) => {
    router.push(`/event/${event.id}`);
  }, [router]);

  // Handle location search from SearchBar
  const handleLocationSelect = useCallback((latitude: number, longitude: number, label: string) => {
    const newRegion: Region = {
      latitude,
      longitude,
      latitudeDelta: 0.05, // Zoom closer on searched location
      longitudeDelta: 0.05,
    };

    // Animate map to new location
    mapRef.current?.animateToRegion(newRegion, 500);
    setMapRegion(newRegion);
  }, []);

  // Handle "My Location" button press
  const handleMyLocation = useCallback(() => {
    if (!userLocation) {
      Alert.alert(
        'Position non disponible',
        'Impossible de récupérer votre position actuelle.',
        [{ text: 'OK' }]
      );
      return;
    }

    const newRegion: Region = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };

    // Animate map to user location
    mapRef.current?.animateToRegion(newRegion, 500);
    setMapRegion(newRegion);
  }, [userLocation]);

  // Handle map type toggle - open modal
  const handleToggleMapType = useCallback(() => {
    setShowMapTypeModal(true);
  }, []);

  // Handle map type selection from modal
  const handleSelectMapType = useCallback((type: 'standard' | 'satellite') => {
    setMapType(type);
  }, []);

  // Handle refresh button
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalider toutes les queries (listes ET détails)
      await Promise.all([
        // Listes
        queryClient.invalidateQueries({ queryKey: ['churches'], exact: false }),
        queryClient.invalidateQueries({ queryKey: ['events'], exact: false }),
        // Détails individuels
        queryClient.invalidateQueries({ queryKey: ['church'], exact: false }),
        queryClient.invalidateQueries({ queryKey: ['event'], exact: false }),
      ]);

      // Forcer le refetch des queries actives sur cette page
      await Promise.all([
        refetchChurches(),
        refetchEvents()
      ]);
    } catch (error) {
      // Silently handle errors
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, refetchChurches, refetchEvents]);

  // Show loading state while getting location
  if (locationLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="background">
        <ActivityIndicator size="large" color="#4285F4" />
        <Text variant="body" color="textSecondary" marginTop="m">
          Obtention de votre position...
        </Text>
      </Box>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <ChurchMap
        ref={mapRef}
        churches={churches}
        events={events}
        userLocation={userLocation}
        mapType={mapType}
        onRegionChange={handleRegionChange}
        onChurchPress={handleChurchPress}
        onEventPress={handleEventPress}
      />

      {/* Search Bar */}
      <SearchBar onLocationSelect={handleLocationSelect} />

      {/* My Location Button */}
      <MyLocationButton onPress={handleMyLocation} />

      {/* Refresh Button */}
      <RefreshButton onPress={handleRefresh} loading={isRefreshing} />

      {/* Map Type Toggle */}
      <MapTypeToggle onPress={handleToggleMapType} />

      {/* Map Type Modal */}
      <MapTypeModal
        visible={showMapTypeModal}
        currentMapType={mapType}
        onClose={() => setShowMapTypeModal(false)}
        onSelectMapType={handleSelectMapType}
      />

      {/* Loading indicator */}
      {(churchesLoading || eventsLoading) && (
        <Box
          position="absolute"
          top={160}
          alignSelf="center"
          backgroundColor="surface"
          paddingHorizontal="m"
          paddingVertical="s"
          borderRadius="round"
          style={styles.loadingBadge}
        >
          <ActivityIndicator size="small" color="#4285F4" />
        </Box>
      )}

      {/* Bottom Sheet */}
      <ChurchesBottomSheet
        ref={bottomSheetRef}
        churches={churches}
        events={events}
        showChurches={showChurches}
        showEvents={showEvents}
        onChurchPress={handleChurchPress}
        onEventPress={handleEventPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingBadge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
