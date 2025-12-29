/**
 * Event Card for list display
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Text } from '@/components/ui';
import type { Event } from '@/types';
import { formatDistance } from '@/utils/geo';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export default React.memo(function EventCard({ event, onPress }: EventCardProps) {
  const startDate = new Date(event.start_datetime);
  const formattedDate = format(startDate, 'dd MMM', { locale: fr });
  const formattedTime = format(startDate, 'HH:mm', { locale: fr });

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
        {/* Date Badge */}
        <Box
          width={48}
          height={48}
          borderRadius="m"
          backgroundColor="warning"
          justifyContent="center"
          alignItems="center"
          marginRight="m"
        >
          <Text variant="small" color="textInverse" fontWeight="700">
            {formattedDate.split(' ')[0]}
          </Text>
          <Text variant="small" color="textInverse" fontSize={10}>
            {formattedDate.split(' ')[1]}
          </Text>
        </Box>

        {/* Content */}
        <Box flex={1}>
          <Text variant="subtitle" numberOfLines={1} marginBottom="xs">
            {event.title}
          </Text>

          <Box flexDirection="row" alignItems="center" flexWrap="wrap">
            <Text variant="caption" color="textSecondary">
              {formattedTime}
            </Text>
            {event.church_name && (
              <>
                <Text variant="caption" color="textSecondary" marginHorizontal="xs">
                  •
                </Text>
                <Text variant="caption" color="textSecondary">
                  {event.church_name}
                </Text>
              </>
            )}
          </Box>

          {event.distance_km !== undefined && (
            <Text variant="small" color="primary" marginTop="xs">
              📍 {formatDistance(event.distance_km)}
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
