/**
 * Filter and Sort Chips Component
 * Google Maps iOS style - Horizontal scrollable chips
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';

export type SortType = 'distance' | 'date';

interface FilterAndSortChipsProps {
  // Filters
  showChurches: boolean;
  showEvents: boolean;
  churchesCount: number;
  eventsCount: number;
  onToggleChurches: () => void;
  onToggleEvents: () => void;
  // Sort
  sortBy: SortType;
  onSortChange: (sortType: SortType) => void;
}

export default function FilterAndSortChips({
  showChurches,
  showEvents,
  churchesCount,
  eventsCount,
  onToggleChurches,
  onToggleEvents,
  sortBy,
  onSortChange,
}: FilterAndSortChipsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Chips - Churches */}
        <TouchableOpacity
          style={[
            styles.chip,
            showChurches ? styles.chipActive : styles.chipInactive,
          ]}
          onPress={onToggleChurches}
          activeOpacity={0.7}
        >
          <View style={styles.chipContent}>
            {showChurches && (
              <Ionicons name="checkmark" size={16} color="#4285F4" style={styles.checkIcon} />
            )}
            <Text
              style={[
                styles.chipText,
                showChurches ? styles.chipTextActive : styles.chipTextInactive,
              ]}
            >
              Églises ({churchesCount})
            </Text>
          </View>
        </TouchableOpacity>

        {/* Filter Chips - Events */}
        <TouchableOpacity
          style={[
            styles.chip,
            showEvents ? styles.chipActive : styles.chipInactive,
          ]}
          onPress={onToggleEvents}
          activeOpacity={0.7}
        >
          <View style={styles.chipContent}>
            {showEvents && (
              <Ionicons name="checkmark" size={16} color="#4285F4" style={styles.checkIcon} />
            )}
            <Text
              style={[
                styles.chipText,
                showEvents ? styles.chipTextActive : styles.chipTextInactive,
              ]}
            >
              Événements ({eventsCount})
            </Text>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Sort Chip - Distance */}
        <TouchableOpacity
          style={[
            styles.chip,
            sortBy === 'distance' ? styles.chipActive : styles.chipInactive,
          ]}
          onPress={() => onSortChange('distance')}
          activeOpacity={0.7}
        >
          <View style={styles.chipContent}>
            {sortBy === 'distance' && (
              <Ionicons name="checkmark" size={16} color="#4285F4" style={styles.checkIcon} />
            )}
            <Text
              style={[
                styles.chipText,
                sortBy === 'distance' ? styles.chipTextActive : styles.chipTextInactive,
              ]}
            >
              Les plus proches
            </Text>
          </View>
        </TouchableOpacity>

        {/* Sort Chip - Date */}
        <TouchableOpacity
          style={[
            styles.chip,
            sortBy === 'date' ? styles.chipActive : styles.chipInactive,
          ]}
          onPress={() => onSortChange('date')}
          activeOpacity={0.7}
        >
          <View style={styles.chipContent}>
            {sortBy === 'date' && (
              <Ionicons name="checkmark" size={16} color="#4285F4" style={styles.checkIcon} />
            )}
            <Text
              style={[
                styles.chipText,
                sortBy === 'date' ? styles.chipTextActive : styles.chipTextInactive,
              ]}
            >
              Les plus récents
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#E8F0FE',
    borderColor: '#4285F4',
  },
  chipInactive: {
    backgroundColor: '#F1F3F4',
    borderColor: '#DADCE0',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#4285F4',
  },
  chipTextInactive: {
    color: '#5F6368',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#DADCE0',
    alignSelf: 'center',
  },
});
