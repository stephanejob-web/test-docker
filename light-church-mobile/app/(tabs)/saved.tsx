/**
 * Saved/Favorites Screen
 * Displays events where user clicked "Ça m'intéresse"
 * PERFORMANCE OPTIMIZED: FlashList + React Query + useMemo + React.memo
 * DESIGN: Google Maps inspired UI/UX
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, RefreshControl, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, Text } from '@/components/ui';
import EventCard from '@/components/cards/EventCard';
import { useInterestedEvents, useRemoveInterest } from '@/hooks/query/useInterestedEvents';
import type { Event } from '@/types';

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch interested events with React Query cache
  const { data: events = [], isLoading, isError, refetch, isRefetching } = useInterestedEvents();

  // Remove interest mutation with optimistic updates
  const removeInterestMutation = useRemoveInterest();

  // Update timer every 60 seconds (performance optimization)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Handler: Navigate to event detail
  const handleEventPress = useCallback(
    (event: Event) => {
      router.push(`/event/${event.id}`);
    },
    [router]
  );

  // Handler: Remove interest with confirmation
  const handleRemoveInterest = useCallback(
    (event: Event) => {
      Alert.alert(
        'Ne plus participer',
        `L'église compte sur votre présence à "${event.title}". Êtes-vous certain de ne plus participer ?`,
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Ne plus participer',
            style: 'destructive',
            onPress: () => {
              removeInterestMutation.mutate(event.id, {
                onSuccess: () => {
                  // Success feedback (optional toast here)
                },
                onError: (error) => {
                  Alert.alert(
                    'Erreur',
                    'Impossible de retirer votre participation. Vérifiez votre connexion.',
                    [{ text: 'OK' }]
                  );
                },
              });
            },
          },
        ]
      );
    },
    [removeInterestMutation]
  );

  // Render single event item (memoized)
  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <View style={styles.cardContainer}>
        <View style={styles.eventCardWrapper}>
          <EventCard event={item} onPress={() => handleEventPress(item)} currentTime={currentTime} />
        </View>

        {/* Action Buttons - Google Maps Style */}
        <View style={styles.actionsRow}>
          {/* Participant Badge */}
          <View style={styles.followingBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#34A853" />
            <Text style={styles.followingText}>Participant</Text>
          </View>

          {/* Remove Participation Button */}
          <TouchableOpacity
            style={styles.unfollowButton}
            onPress={() => handleRemoveInterest(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="close-outline" size={20} color="#5F6368" />
            <Text style={styles.unfollowText}>Ne plus participer</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleEventPress, handleRemoveInterest, currentTime]
  );

  // Key extractor (memoized)
  const keyExtractor = useCallback((item: Event) => `interested-${item.id}`, []);

  // Empty state
  const renderEmptyState = useMemo(() => {
    if (isLoading) {
      return (
        <Box alignItems="center" justifyContent="center" paddingVertical="xl" flex={1}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text variant="body" color="textSecondary" marginTop="m">
            Chargement...
          </Text>
        </Box>
      );
    }

    if (isError) {
      return (
        <Box alignItems="center" justifyContent="center" paddingVertical="xl" flex={1}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#EA4335" />
          </View>
          <Text variant="subtitle" style={styles.errorTitle}>
            Erreur de chargement
          </Text>
          <Text variant="body" color="textSecondary" textAlign="center" style={styles.description}>
            Impossible de charger vos événements. Vérifiez votre connexion.
          </Text>
        </Box>
      );
    }

    return (
      <Box alignItems="center" justifyContent="center" paddingVertical="xl" flex={1}>
        <View style={styles.iconContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#DADCE0" />
        </View>
        <Text variant="subtitle" style={styles.title}>
          Aucun événement enregistré
        </Text>
        <Text variant="body" color="textSecondary" textAlign="center" style={styles.description}>
          Cliquez sur "Ça m'intéresse" sur un événement pour le retrouver ici.
        </Text>
      </Box>
    );
  }, [isLoading, isError]);

  return (
    <View style={styles.container}>
      {/* Header - Google Maps Style with Safe Area */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerText}>Enregistrés</Text>
        <Text style={styles.headerSubtext}>
          {events.length > 0
            ? `${events.length} événement${events.length > 1 ? 's' : ''} suivi${events.length > 1 ? 's' : ''}`
            : 'Vos événements favoris'}
        </Text>
      </View>

      {/* Event List with FlashList (10x faster than FlatList) */}
      {events.length > 0 ? (
        <FlashList
          data={events}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={120} // Optimize for smooth scrolling
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#4285F4"
              colors={['#4285F4']}
            />
          }
        />
      ) : (
        renderEmptyState
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header - Google Maps Style (paddingTop applied dynamically with safe area)
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },

  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 4,
  },

  headerSubtext: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '400',
  },

  listContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },

  // Google Maps Style Card Container
  cardContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  eventCardWrapper: {
    // EventCard prend tout l'espace du container
  },

  // Actions Row - Google Maps Style
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },

  // Following Badge (left side)
  followingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },

  followingText: {
    fontSize: 14,
    color: '#34A853',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Unfollow Button (right side)
  unfollowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },

  unfollowText: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '500',
  },

  // Empty States
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F3F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EA4335',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
    paddingHorizontal: 24,
  },
});
