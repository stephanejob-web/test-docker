/**
 * Church Card for list display
 * Premium UI with shadows and icons
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Box, Text } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import type { Church } from '@/types';
import { formatDistance } from '@/utils/geo';

interface ChurchCardProps {
  church: Church;
  onPress: () => void;
}

export default React.memo(function ChurchCard({ church, onPress }: ChurchCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <Box
        backgroundColor="surface"
        borderRadius="l"
        padding="m"
        flexDirection="row"
        alignItems="center"
        style={styles.shadow}
      >
        {/* Icon */}
        <Box
          width={48}
          height={48}
          borderRadius="round"
          backgroundColor="card"
          justifyContent="center"
          alignItems="center"
          marginRight="m"
        >
          <Ionicons name="business" size={24} color="#4285F4" />
        </Box>

        {/* Content */}
        <Box flex={1}>
          <Text variant="subtitle" numberOfLines={1} marginBottom="xs">
            {church.church_name}
          </Text>

          <Box flexDirection="row" alignItems="center" flexWrap="wrap">
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {church.denomination_name}
            </Text>
            {church.distance_km !== undefined && (
              <>
                <Text variant="caption" color="textSecondary" marginHorizontal="xs">
                  •
                </Text>
                <Text variant="caption" color="primary" fontWeight="600">
                  {formatDistance(church.distance_km)}
                </Text>
              </>
            )}
          </Box>

          {church.city && (
            <Box flexDirection="row" alignItems="center" marginTop="xs">
              <Ionicons name="location-outline" size={12} color="#80868B" style={{ marginRight: 2 }} />
              <Text variant="small" color="textTertiary">
                {church.city}
              </Text>
            </Box>
          )}
        </Box>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color="#4285F4" />
      </Box>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

