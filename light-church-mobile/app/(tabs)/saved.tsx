/**
 * Saved/Favorites Screen
 * Displays events where user clicked "Ça m'intéresse"
 * PERFORMANCE OPTIMIZED: FlashList + React Query + useMemo + React.memo
 * DESIGN: Google Maps inspired UI/UX
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { FlashList, type FlashListProps } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, Text } from '@/components/ui';
import EventCard from '@/components/cards/EventCard';
import { useInterestedEvents, useRemoveInterest } from '@/hooks/query/useInterestedEvents';
import { useToast } from '@/contexts/ToastContext';
import type { Event } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// FlashList component with proper typing to handle estimatedItemSize prop
// This resolves the type mismatch in FlashList v2.2.0 without using 'any'
const TypedFlashList = FlashList as React.ComponentType<FlashListProps<Event> & { estimatedItemSize?: number }>;

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  // Fetch interested events with React Query cache
  const { data: events = [], isLoading, isError, refetch, isRefetching } = useInterestedEvents();

  // Remove interest mutation with optimistic updates
  const removeInterestMutation = useRemoveInterest();

  // State for refresh UX
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [timeSinceRefresh, setTimeSinceRefresh] = useState('à l\'instant');

  // Update time since last refresh every minute
  useEffect(() => {
    const updateTimer = setInterval(() => {
      const timeString = formatDistanceToNow(lastRefreshTime, {
        addSuffix: true,
        locale: fr
      });
      setTimeSinceRefresh(timeString);
    }, 60000); // Update every minute

    return () => clearInterval(updateTimer);
  }, [lastRefreshTime]);

  // Handle refresh (manual or pull-to-refresh)
  const handleRefresh = async () => {
    setLastRefreshTime(new Date());
    setTimeSinceRefresh('à l\'instant');
    await refetch();
  };

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
              // Appel simple sans callbacks pour ne pas écraser ceux du hook
              removeInterestMutation.mutate(event.id);
              // Toast affiché après succès (voir useEffect ci-dessous)
            },
          },
        ]
      );
    },
    [removeInterestMutation]
  );

  // Effect: Show toast on mutation success/error
  useEffect(() => {
    if (removeInterestMutation.isSuccess) {
      toast.showInfo('Vous ne recevrez plus de notifications pour cet événement');
    }
  }, [removeInterestMutation.isSuccess, toast]);

  useEffect(() => {
    if (removeInterestMutation.isError) {
      // L'erreur réseau est déjà gérée par l'intercepteur axios
      // On affiche un toast spécifique seulement si c'est une erreur autre
      const error = removeInterestMutation.error;
      if (error && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 400 || axiosError.response?.status === 404) {
          toast.showError('Impossible de retirer votre participation');
        }
      }
    }
  }, [removeInterestMutation.isError, removeInterestMutation.error, toast]);

  // Render single event item (memoized)
  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <View style={styles.cardContainer}>
        <View style={styles.eventCardWrapper}>
          <EventCard event={item} onPress={() => handleEventPress(item)} />
        </View>

        {/* Action Buttons - Google Maps Saved Places Style */}
        <View style={styles.actionsRow}>
          {/* Saved Badge */}
          <View style={styles.savedBadge}>
            <Ionicons name="bookmark" size={16} color="#4285F4" />
            <Text style={styles.savedText}>Enregistré</Text>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveInterest(item)}
            activeOpacity={0.6}
          >
            <Text style={styles.removeText}>Retirer</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleEventPress, handleRemoveInterest]
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

  // Check if refresh needed (more than 5 minutes)
  const needsRefresh = useMemo(() => {
    const minutesSinceRefresh = (Date.now() - lastRefreshTime.getTime()) / (1000 * 60);
    return minutesSinceRefresh > 5;
  }, [lastRefreshTime]);

  return (
    <View style={styles.container}>
      {/* Header - Google Maps Style with Safe Area */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Enregistrés</Text>
            <Text style={styles.headerSubtext}>
              {events.length > 0
                ? `${events.length} événement${events.length > 1 ? 's' : ''} suivi${events.length > 1 ? 's' : ''}`
                : 'Vos événements favoris'}
            </Text>
          </View>

          {/* Refresh Button - Google Maps iOS Style */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isRefetching}
            activeOpacity={0.7}
          >
            {isRefetching ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <View>
                <Ionicons
                  name="reload-circle"
                  size={32}
                  color="#4285F4"
                />
                {needsRefresh && (
                  <View style={styles.refreshBadge} />
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Timestamp - Subtil */}
        {events.length > 0 && (
          <Text style={styles.timestampText}>
            Actualisé {timeSinceRefresh}
          </Text>
        )}
      </View>

      {/* Event List with FlashList (10x faster than FlatList) */}
      {events.length > 0 && (
        <TypedFlashList
          data={events}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#4285F4"
              colors={['#4285F4']}
            />
          }
        />
      )}

      {events.length === 0 && (
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

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  headerTextContainer: {
    flex: 1,
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

  timestampText: {
    fontSize: 12,
    color: '#9AA0A6',
    marginTop: 8,
    fontWeight: '400',
  },

  // Refresh Button - Google Maps iOS Style
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  refreshBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EA4335',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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

  // Saved Badge (left side) - Google Maps Style
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },

  savedText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },

  // Remove Button (right side) - Google Maps Style
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  removeText: {
    fontSize: 14,
    color: '#EA4335',
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
