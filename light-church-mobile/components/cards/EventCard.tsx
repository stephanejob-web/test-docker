/**
 * Event Card for list display
 * Premium UI with shadows and refined layout
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Box, Text } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentTime } from '@/contexts/TimeContext';
import type { Event } from '@/types';
import { formatDistance } from '@/utils/geo';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

/**
 * Helper function pour calculer le temps restant jusqu'à la fin d'un événement
 */
const getRemainingTime = (endDatetime: string | null | undefined, currentTime: Date): { text: string; totalMinutes: number } | null => {
  if (!endDatetime) return null;

  try {
    const end = new Date(endDatetime);
    const now = currentTime;
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

export default React.memo(function EventCard({ event, onPress }: EventCardProps) {
  // Use global time context - only this component re-renders every minute
  const currentTime = useCurrentTime();

  const startDate = new Date(event.start_datetime);
  const endDate = event.end_datetime ? new Date(event.end_datetime) : null;
  const formattedDay = format(startDate, 'dd', { locale: fr });
  const formattedMonth = format(startDate, 'MMM', { locale: fr }).toUpperCase();
  const formattedTime = format(startDate, 'HH:mm', { locale: fr });

  // Calculer le statut de l'événement
  const eventStatus = useMemo(() => {
    const now = currentTime;
    if (endDate && now >= startDate && now <= endDate) return 'ONGOING';
    if (now < startDate) return 'UPCOMING';
    return 'COMPLETED';
  }, [startDate, endDate, currentTime]);

  // Calculer le temps restant si ONGOING
  const remaining = useMemo(() => {
    if (eventStatus === 'ONGOING' && event.end_datetime) {
      return getRemainingTime(event.end_datetime, currentTime);
    }
    return null;
  }, [eventStatus, event.end_datetime, currentTime]);

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
        {/* Date Badge */}
        <Box
          width={54}
          height={54}
          borderRadius="l"
          backgroundColor="card"
          justifyContent="center"
          alignItems="center"
          marginRight="m"
          borderWidth={1}
          borderColor="border"
        >
          <Text variant="small" color="error" fontWeight="700" textTransform="uppercase" fontSize={10}>
            {formattedMonth}
          </Text>
          <Text variant="title" color="text" fontWeight="700" fontSize={20} lineHeight={24}>
            {formattedDay}
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
                  backgroundColor: remaining.totalMinutes <= 30 ? '#EA4335' : '#FBBC04',
                },
              ]}
            >
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Ionicons name="time" size={12} color="#FFFFFF" />
                <Text
                  variant="small"
                  style={styles.countdownText}
                >
                  {remaining.text}
                </Text>
              </Box>
            </Box>
          )}

          <Box flexDirection="row" alignItems="center" flexWrap="wrap" marginBottom="xs">
            <Ionicons name="time-outline" size={14} color="#80868B" style={{ marginRight: 4 }} />
            <Text variant="caption" color="textSecondary">
              {formattedTime}
            </Text>
            {event.church_name && (
              <>
                <Text variant="caption" color="textSecondary" marginHorizontal="xs">
                  •
                </Text>
                <Text variant="caption" color="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
                  {event.church_name}
                </Text>
              </>
            )}
          </Box>

          <Box flexDirection="row" alignItems="center" flexWrap="wrap" gap="m">
            {event.distance_km !== undefined && (
              <Box flexDirection="row" alignItems="center">
                <Ionicons name="location-sharp" size={12} color="#4285F4" style={{ marginRight: 2 }} />
                <Text variant="small" color="primary" fontWeight="500">
                  {formatDistance(event.distance_km)}
                </Text>
              </Box>
            )}
            {event.interested_count !== undefined && event.interested_count > 0 && (
              <Box flexDirection="row" alignItems="center">
                <Ionicons name="people" size={12} color="#80868B" style={{ marginRight: 2 }} />
                <Text variant="small" color="textSecondary">
                  {event.interested_count}
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color="#DADCE0" />
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
  countdownBadge: {
    alignSelf: 'flex-start',
  },
  countdownText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

