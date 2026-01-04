/**
 * Sort Chips Component
 * Google Maps iOS style sorting chips for events
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box, Text } from '@/components/ui';

export type SortType = 'distance' | 'date';

interface SortChipsProps {
  sortBy: SortType;
  onSortChange: (sortType: SortType) => void;
}

export default function SortChips({ sortBy, onSortChange }: SortChipsProps) {
  return (
    <Box paddingHorizontal="m" paddingVertical="s">
      <Box flexDirection="row" alignItems="center" gap="s">
        {/* Distance Chip */}
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

        {/* Date Chip */}
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
      </Box>

      {/* Sort description - Google Maps style */}
      <Text variant="caption" color="textSecondary" marginTop="xs" marginLeft="xs">
        {sortBy === 'distance'
          ? 'Triés par distance de votre position'
          : 'Triés par date de création (nouveaux en premier)'}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
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
});
