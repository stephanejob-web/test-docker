/**
 * Main Map Component with clustering
 */

import React, { useCallback, forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering';
import { MAP_CONFIG, COLORS } from '@/constants/config';
import type { Church, Event, UserLocation } from '@/types';

interface ChurchMapProps {
  churches: Church[];
  events: Event[];
  userLocation: UserLocation | null;
  onRegionChange?: (region: Region) => void;
  onChurchPress?: (church: Church) => void;
  onEventPress?: (event: Event) => void;
  initialRegion?: Region;
  mapType?: 'standard' | 'satellite';
}

const ChurchMap = forwardRef<MapView, ChurchMapProps>(({
  churches = [],
  events = [],
  userLocation,
  onRegionChange,
  onChurchPress,
  onEventPress,
  initialRegion,
  mapType = 'standard',
}, ref) => {

  const defaultRegion: Region = {
    latitude: userLocation?.latitude || MAP_CONFIG.DEFAULT_LATITUDE,
    longitude: userLocation?.longitude || MAP_CONFIG.DEFAULT_LONGITUDE,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const handleRegionChangeComplete = useCallback((region: Region) => {
    onRegionChange?.(region);
  }, [onRegionChange]);

  return (
    <MapViewClustering
      ref={ref}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      mapType={mapType}
      initialRegion={initialRegion || defaultRegion}
      onRegionChangeComplete={handleRegionChangeComplete}
      clusterColor={COLORS.PRIMARY}
      clusterTextColor={COLORS.WHITE}
      radius={MAP_CONFIG.CLUSTERING_RADIUS}
      maxZoom={18}
      minZoom={3}
      showsUserLocation={!!userLocation}
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      {/* Church Markers */}
      {churches.map((church) => (
        <Marker
          key={`church-${church.id}`}
          coordinate={{
            latitude: church.latitude,
            longitude: church.longitude,
          }}
          title={church.church_name}
          description={church.denomination_name}
          pinColor={COLORS.PRIMARY}
          onPress={() => onChurchPress?.(church)}
        />
      ))}

      {/* Event Markers */}
      {events.map((event) => (
        <Marker
          key={`event-${event.id}`}
          coordinate={{
            latitude: event.latitude,
            longitude: event.longitude,
          }}
          title={event.title}
          description={event.church_name}
          pinColor={COLORS.WARNING}
          onPress={() => onEventPress?.(event)}
        />
      ))}
    </MapViewClustering>
  );
});

ChurchMap.displayName = 'ChurchMap';

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default ChurchMap;
