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
  const isSameDay = endDate ? startDate.toDateString() === endDate.toDateString() : true;
  const formattedDay = isSameDay
    ? format(startDate, 'dd', { locale: fr })
    : `${format(startDate, 'd', { locale: fr })}-${format(endDate!, 'd', { locale: fr })}`;
  const formattedMonth = format(startDate, 'MMM', { locale: fr }).toUpperCase();
  const formattedTime = isSameDay
    ? format(startDate, 'HH:mm', { locale: fr })
    : `${format(startDate, 'd MMM', { locale: fr })} - ${format(endDate!, 'd MMM', { locale: fr })}`;

  // Calculer le statut de l'événement
  const eventStatus = useMemo(() => {
    // Priorité à l'annulation
    if (event.cancelled_at) return 'CANCELLED';

    const now = currentTime;
    if (endDate && now >= startDate && now <= endDate) return 'ONGOING';
    if (now < startDate) return 'UPCOMING';
    return 'COMPLETED';
  }, [startDate, endDate, currentTime, event.cancelled_at]);

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
        backgroundColor={eventStatus === 'CANCELLED' ? 'disabled' : 'surface'}
        borderRadius="l"
        padding="m"
        flexDirection="row"
        alignItems="center"
        style={[
          styles.shadow,
          eventStatus === 'CANCELLED' && styles.cancelledCard,
        ]}
      >
        {/* Badge ANNULÉ (Google Maps style) */}
        {eventStatus === 'CANCELLED' && (
          <Box
            position="absolute"
            top={8}
            left={8}
            backgroundColor="error"
            paddingHorizontal="s"
            paddingVertical="xs"
            borderRadius="s"
            style={{ zIndex: 10 }}
          >
            <Text variant="small" fontWeight="700" fontSize={11} style={{ color: '#FFFFFF' }}>
              ANNULÉ
            </Text>
          </Box>
        )}

        {/* Date Badge */}
        <Box
          width={isSameDay ? 54 : 64}
          height={54}
          borderRadius="l"
          backgroundColor={eventStatus === 'CANCELLED' ? 'card' : 'card'}
          justifyContent="center"
          alignItems="center"
          marginRight="m"
          borderWidth={1}
          borderColor="border"
          style={eventStatus === 'CANCELLED' && { opacity: 0.5 }}
        >
          <Text
            variant="small"
            color={eventStatus === 'CANCELLED' ? 'textSecondary' : 'error'}
            fontWeight="700"
            textTransform="uppercase"
            fontSize={10}
          >
            {formattedMonth}
          </Text>
          <Text
            variant="title"
            color={eventStatus === 'CANCELLED' ? 'textSecondary' : 'text'}
            fontWeight="700"
            fontSize={isSameDay ? 20 : 16}
            lineHeight={isSameDay ? 24 : 20}
          >
            {formattedDay}
          </Text>
        </Box>

        {/* Content */}
        <Box flex={1}>
          <Text
            variant="subtitle"
            numberOfLines={1}
            marginBottom="xs"
            style={eventStatus === 'CANCELLED' && { opacity: 0.7 }}
          >
            {event.title}
          </Text>

          {/* Raison d'annulation (Google Maps style) */}
          {eventStatus === 'CANCELLED' && event.cancellation_reason && (
            <Box
              marginBottom="xs"
              paddingHorizontal="s"
              paddingVertical="xs"
              borderRadius="s"
              backgroundColor="card"
              flexDirection="row"
              alignItems="center"
              style={{ borderLeftWidth: 3, borderLeftColor: '#EA4335' }}
            >
              <Ionicons name="information-circle" size={14} color="#EA4335" />
              <Text
                variant="small"
                color="textSecondary"
                marginLeft="xs"
                numberOfLines={1}
                style={{ flex: 1 }}
              >
                {event.cancellation_reason}
              </Text>
            </Box>
          )}

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
            {event.event_city && (
              <Box flexDirection="row" alignItems="center">
                <Ionicons name="location-outline" size={12} color="#80868B" style={{ marginRight: 2 }} />
                <Text variant="small" color="textSecondary">
                  {event.event_city}
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
  cancelledCard: {
    opacity: 0.85,
    borderWidth: 1,
    borderColor: '#EA4335',
    backgroundColor: '#F8F9FA',
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

