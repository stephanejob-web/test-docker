/**
 * Bottom Sheet for displaying churches and events
 * Google Maps style with 3 snap points
 */

import React, { useMemo, useCallback, forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Box, Text } from '@/components/ui';
import ChurchCard from '@/components/cards/ChurchCard';
import EventCard from '@/components/cards/EventCard';
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
  ({ churches, events, showChurches, showEvents, onChurchPress, onEventPress }, ref) => {
    // Snap points: peek (12%), half (50%), full (90%)
    const snapPoints = useMemo(() => ['12%', '50%', '90%'], []);

    // Combine and filter data
    const data = useMemo(() => {
      const items: Array<{ type: 'church' | 'event'; data: Church | Event }> = [];

      if (showChurches) {
        churches.forEach(church => items.push({ type: 'church', data: church }));
      }

      if (showEvents) {
        events.forEach(event => items.push({ type: 'event', data: event }));
      }

      // Sort by distance if available
      return items.sort((a, b) => {
        const distA = 'distance_km' in a.data ? a.data.distance_km : Infinity;
        const distB = 'distance_km' in b.data ? b.data.distance_km : Infinity;
        return (distA || Infinity) - (distB || Infinity);
      });
    }, [churches, events, showChurches, showEvents]);

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

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.background}
      >
        <Box padding="m" borderBottomWidth={1} borderBottomColor="border">
          <Text variant="title">
            {data.length} {data.length > 1 ? 'résultats' : 'résultat'}
          </Text>
          <Text variant="caption" color="textSecondary" marginTop="xs">
            {showChurches && showEvents && 'Églises et événements'}
            {showChurches && !showEvents && 'Églises'}
            {!showChurches && showEvents && 'Événements'}
          </Text>
        </Box>

        <BottomSheetFlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
