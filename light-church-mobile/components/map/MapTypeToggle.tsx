/**
 * MapTypeToggle Component
 * Toggle between Standard, Satellite, and Hybrid map views
 * Google Maps style
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';

type MapType = 'standard' | 'satellite' | 'hybrid';

interface MapTypeToggleProps {
  mapType: MapType;
  onToggle: () => void;
}

const MAP_TYPE_LABELS: Record<MapType, string> = {
  standard: 'Plan',
  satellite: 'Satellite',
  hybrid: 'Hybride',
};

const MAP_TYPE_ICONS: Record<MapType, any> = {
  standard: 'map-outline',
  satellite: 'planet-outline',
  hybrid: 'layers-outline',
};

export default function MapTypeToggle({ mapType, onToggle }: MapTypeToggleProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Ionicons
        name={MAP_TYPE_ICONS[mapType]}
        size={20}
        color="#4285F4"
        style={styles.icon}
      />
      <Text variant="caption" style={styles.label}>
        {MAP_TYPE_LABELS[mapType]}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#202124',
  },
});
