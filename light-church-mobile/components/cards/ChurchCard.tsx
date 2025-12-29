/**
 * Church Card for list display
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box, Text } from '@/components/ui';
import type { Church } from '@/types';
import { formatDistance } from '@/utils/geo';

interface ChurchCardProps {
  church: Church;
  onPress: () => void;
}

export default React.memo(function ChurchCard({ church, onPress }: ChurchCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Box
        backgroundColor="surface"
        borderBottomWidth={1}
        borderBottomColor="border"
        padding="m"
        flexDirection="row"
        alignItems="center"
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
          <Text variant="title" color="primary">
            ⛪
          </Text>
        </Box>

        {/* Content */}
        <Box flex={1}>
          <Text variant="subtitle" numberOfLines={1} marginBottom="xs">
            {church.church_name}
          </Text>

          <Box flexDirection="row" alignItems="center" flexWrap="wrap">
            <Text variant="caption" color="textSecondary">
              {church.denomination_name}
            </Text>
            {church.distance_km !== undefined && (
              <>
                <Text variant="caption" color="textSecondary" marginHorizontal="xs">
                  •
                </Text>
                <Text variant="caption" color="primary">
                  {formatDistance(church.distance_km)}
                </Text>
              </>
            )}
          </Box>

          {church.city && (
            <Text variant="small" color="textTertiary" marginTop="xs">
              {church.city}
            </Text>
          )}
        </Box>

        {/* Chevron */}
        <Text variant="title" color="border">
          ›
        </Text>
      </Box>
    </TouchableOpacity>
  );
});
