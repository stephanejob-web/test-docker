/**
 * Event Card for list display
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box, Text } from '@/components/ui';
import type { Event } from '@/types';
import { formatDistance } from '@/utils/geo';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  currentTime?: Date; // Timer global pour performance
}

/**
 * Helper function pour calculer le temps restant jusqu'à la fin d'un événement
 */
const getRemainingTime = (endDatetime: string | null | undefined): { text: string; totalMinutes: number } | null => {
  if (!endDatetime) return null;

  try {
    const end = new Date(endDatetime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const totalMinutes = Math.floor(diff / (1000 * 60));

    let text = '';
    if (hours > 0) {
      text = `Fin dans ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    } else if (minutes > 0) {
      text = `Fin dans ${minutes} min`;
    } else {
      text = 'Se termine maintenant';
    }

    return { text, totalMinutes };
  } catch {
    return null;
  }
};

export default React.memo(function EventCard({ event, onPress, currentTime }: EventCardProps) {
  const startDate = new Date(event.start_datetime);
  const endDate = event.end_datetime ? new Date(event.end_datetime) : null;
  const formattedDate = format(startDate, 'dd MMM', { locale: fr });
  const formattedTime = format(startDate, 'HH:mm', { locale: fr });

  // Calculer le statut de l'événement (utilise currentTime pour trigger re-renders)
  const eventStatus = useMemo(() => {
    const now = currentTime || new Date();
    if (endDate && now >= startDate && now <= endDate) return 'ONGOING';
    if (now < startDate) return 'UPCOMING';
    return 'COMPLETED';
  }, [startDate, endDate, currentTime]);

  // Calculer le temps restant si ONGOING
  const remaining = useMemo(() => {
    if (eventStatus === 'ONGOING' && event.end_datetime) {
      return getRemainingTime(event.end_datetime);
    }
    return null;
  }, [eventStatus, event.end_datetime, currentTime]);

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

          {/* Décompte temps réel pour événements EN COURS */}
          {remaining && (
            <Box
              marginBottom="xs"
              paddingHorizontal="s"
              paddingVertical="xs"
              borderRadius="s"
              style={[
                styles.countdownBadge,
                {
                  backgroundColor: remaining.totalMinutes <= 30 ? '#f44336' : '#ff9800',
                },
              ]}
            >
              <Text
                variant="small"
                style={styles.countdownText}
              >
                ⏰ {remaining.text}
              </Text>
            </Box>
          )}

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

          <Box flexDirection="row" alignItems="center" flexWrap="wrap" marginTop="xs" gap="s">
            {event.distance_km !== undefined && (
              <Text variant="small" color="primary">
                📍 {formatDistance(event.distance_km)}
              </Text>
            )}
            {event.interested_count !== undefined && event.interested_count > 0 && (
              <Text variant="small" color="textSecondary">
                👥 {event.interested_count}
              </Text>
            )}
          </Box>
        </Box>

        {/* Chevron */}
        <Text variant="title" color="border">
          ›
        </Text>
      </Box>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  countdownBadge: {
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  countdownText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
