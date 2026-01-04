/**
 * Bottom Sheet for displaying churches and events
 * Google Maps style with 3 snap points
 */

import React, { useMemo, useCallback, forwardRef, useState, useDeferredValue } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Box, Text } from '@/components/ui';
import ChurchCard from '@/components/cards/ChurchCard';
import EventCard from '@/components/cards/EventCard';
import FilterAndSortChips, { SortType } from '@/components/map/FilterAndSortChips';
import SearchInput from './SearchInput';
import { useDebounce } from '@/hooks/useDebounce';
import type { Church, Event } from '@/types';

interface ChurchesBottomSheetProps {
  churches: Church[];
  events: Event[];
  showChurches: boolean;
  showEvents: boolean;
  onChurchPress: (church: Church) => void;
  onEventPress: (event: Event) => void;
}

const ChurchesBottomSheet = forwardRef<BottomSheet, ChurchesBottomSheetProps>(
  ({ churches, events, showChurches: initialShowChurches, showEvents: initialShowEvents, onChurchPress, onEventPress }, ref) => {
    // Snap points: peek (12%), half (50%), full (90%)
    const snapPoints = useMemo(() => ['12%', '50%', '90%'], []);

    // Internal filter state (independent from map filters)
    const [filterChurches, setFilterChurches] = useState(true);
    const [filterEvents, setFilterEvents] = useState(true);

    // Sort state
    const [sortBy, setSortBy] = useState<SortType>('distance');

    // Search query state
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300); // Google Maps style: 300ms debounce

    // Deferred value for non-blocking filtering (React 18+)
    const deferredSearchQuery = useDeferredValue(debouncedSearchQuery);

    // Check if filtering is in progress (UI remains responsive)
    const isFiltering = deferredSearchQuery !== debouncedSearchQuery;

    // Toggle filters with auto-adjustment
    const handleToggleChurches = useCallback(() => {
      setFilterChurches(prev => {
        const newValue = !prev;

        // If enabling churches while in date sort, switch to distance sort
        // Because date sorting doesn't make sense for churches
        if (newValue && sortBy === 'date') {
          setSortBy('distance');
        }

        return newValue;
      });
    }, [sortBy]);

    const handleToggleEvents = useCallback(() => {
      setFilterEvents(prev => !prev);
    }, []);

    // Handle sort change with auto-adjustment
    const handleSortChange = useCallback((newSortType: SortType) => {
      setSortBy(newSortType);

      // Auto-adjust filters when switching to date sort
      // "Les plus récents" only makes sense for events, not churches
      if (newSortType === 'date') {
        setFilterChurches(false); // Disable churches
        setFilterEvents(true);    // Enable events
      }
    }, []);

    // Combine and filter data based on internal filters + search query
    // Using deferredSearchQuery for non-blocking filtering
    const data = useMemo(() => {
      const items: Array<{ type: 'church' | 'event'; data: Church | Event }> = [];

      // Apply both map filters AND bottom sheet filters
      if (initialShowChurches && filterChurches) {
        churches.forEach(church => items.push({ type: 'church', data: church }));
      }

      if (initialShowEvents && filterEvents) {
        events.forEach(event => items.push({ type: 'event', data: event }));
      }

      // Apply search filter (Google Maps style: simple string matching)
      // Using deferredSearchQuery keeps UI responsive during filtering
      let filteredItems = items;
      if (deferredSearchQuery.trim()) {
        const query = deferredSearchQuery.toLowerCase().trim();

        filteredItems = items.filter(item => {
          if (item.type === 'church') {
            const church = item.data as Church;
            return (
              church.church_name?.toLowerCase().includes(query) ||
              church.denomination_name?.toLowerCase().includes(query) ||
              church.city?.toLowerCase().includes(query)
            );
          } else {
            const event = item.data as Event;
            return (
              event.title?.toLowerCase().includes(query) ||
              event.church_name?.toLowerCase().includes(query) ||
              event.city?.toLowerCase().includes(query)
            );
          }
        });
      }

      // Sort based on selected sort type
      return filteredItems.sort((a, b) => {
        if (sortBy === 'distance') {
          // Sort by distance (closest first)
          const distA = 'distance_km' in a.data ? a.data.distance_km : Infinity;
          const distB = 'distance_km' in b.data ? b.data.distance_km : Infinity;
          return (distA || Infinity) - (distB || Infinity);
        } else {
          // Sort by creation date (newest first)
          const dateA = new Date(a.data.created_at || 0).getTime();
          const dateB = new Date(b.data.created_at || 0).getTime();
          return dateB - dateA; // Newest first
        }
      });
    }, [churches, events, initialShowChurches, initialShowEvents, filterChurches, filterEvents, deferredSearchQuery, sortBy]);

    const renderItem = useCallback(({ item }: { item: typeof data[0] }) => {
      if (item.type === 'church') {
        return <ChurchCard church={item.data as Church} onPress={() => onChurchPress(item.data as Church)} />;
      } else {
        return <EventCard event={item.data as Event} onPress={() => onEventPress(item.data as Event)} />;
      }
    }, [onChurchPress, onEventPress]);

    const keyExtractor = useCallback((item: typeof data[0]) => {
      return `${item.type}-${item.data.id}`;
    }, []);

    // Calculate total items before search filter (for conditional search bar display)
    const totalItems = useMemo(() => {
      let count = 0;
      if (initialShowChurches && filterChurches) count += churches.length;
      if (initialShowEvents && filterEvents) count += events.length;
      return count;
    }, [churches.length, events.length, initialShowChurches, initialShowEvents, filterChurches, filterEvents]);

    // Show search bar only if there are more than 15 results (Google Maps style)
    const showSearchBar = totalItems > 15;

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.background}
      >
        {/* Header */}
        <Box padding="m" borderBottomWidth={1} borderBottomColor="border">
          <Text variant="title">
            {data.length} {data.length > 1 ? 'résultats' : 'résultat'}
          </Text>
          <Text variant="caption" color="textSecondary" marginTop="xs">
            {filterChurches && filterEvents && 'Églises et événements'}
            {filterChurches && !filterEvents && 'Églises uniquement'}
            {!filterChurches && filterEvents && 'Événements uniquement'}
            {!filterChurches && !filterEvents && 'Aucun filtre sélectionné'}
          </Text>
        </Box>

        {/* Search Input (Google Maps style - only if >15 results) */}
        {showSearchBar && (
          <Box>
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Filtrer les résultats..."
              resultCount={deferredSearchQuery.trim() ? data.length : undefined}
            />
            {/* Loading indicator during non-blocking filter */}
            {isFiltering && (
              <Box
                position="absolute"
                right={16}
                top={20}
                flexDirection="row"
                alignItems="center"
                gap="xs"
              >
                <ActivityIndicator size="small" color="#4285F4" />
                <Text variant="caption" color="textSecondary">
                  Filtrage...
                </Text>
              </Box>
            )}
          </Box>
        )}

        {/* Filter & Sort Chips - Google Maps iOS Style (Horizontal Scroll) */}
        <FilterAndSortChips
          showChurches={filterChurches}
          showEvents={filterEvents}
          churchesCount={churches.length}
          eventsCount={events.length}
          onToggleChurches={handleToggleChurches}
          onToggleEvents={handleToggleEvents}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {/* Results List */}
        {data.length > 0 ? (
          <BottomSheetFlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Box padding="xl" alignItems="center" justifyContent="center" flex={1}>
            <Text variant="body" color="textSecondary" textAlign="center">
              {!filterChurches && !filterEvents
                ? 'Veuillez sélectionner au moins un filtre'
                : 'Aucun résultat ne correspond à vos filtres'}
            </Text>
          </Box>
        )}
      </BottomSheet>
    );
  }
);

ChurchesBottomSheet.displayName = 'ChurchesBottomSheet';

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: '#DADCE0',
    width: 40,
    height: 4,
  },
  background: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  listContent: {
    paddingBottom: 100,
  },
});

export default ChurchesBottomSheet;
