/**
 * Filter Chips Component - Google Maps Style
 * Toggle chips to filter churches and events
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';

interface FilterChipsProps {
  showChurches: boolean;
  showEvents: boolean;
  churchesCount: number;
  eventsCount: number;
  onToggleChurches: () => void;
  onToggleEvents: () => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  showChurches,
  showEvents,
  churchesCount,
  eventsCount,
  onToggleChurches,
  onToggleEvents,
}) => {
  return (
    <View style={styles.container}>
      <Text variant="caption" color="textSecondary" style={styles.label}>
        Filtres:
      </Text>

      <View style={styles.chipsRow}>
        {/* Chip Églises */}
        <TouchableOpacity
          style={[
            styles.chip,
            showChurches ? styles.chipActive : styles.chipInactive,
          ]}
          onPress={onToggleChurches}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showChurches ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={showChurches ? '#4285F4' : '#9AA0A6'}
            style={styles.checkIcon}
          />
          <Ionicons
            name="business"
            size={14}
            color={showChurches ? '#4285F4' : '#9AA0A6'}
            style={styles.icon}
          />
          <Text
            variant="body"
            style={[
              styles.chipText,
              showChurches ? styles.chipTextActive : styles.chipTextInactive,
            ]}
          >
            Églises
          </Text>
          <View
            style={[
              styles.badge,
              showChurches ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Text
              variant="caption"
              style={[
                styles.badgeText,
                showChurches ? styles.badgeTextActive : styles.badgeTextInactive,
              ]}
            >
              {churchesCount}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Chip Événements */}
        <TouchableOpacity
          style={[
            styles.chip,
            showEvents ? styles.chipActive : styles.chipInactive,
          ]}
          onPress={onToggleEvents}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showEvents ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={showEvents ? '#EA4335' : '#9AA0A6'}
            style={styles.checkIcon}
          />
          <Ionicons
            name="calendar"
            size={14}
            color={showEvents ? '#EA4335' : '#9AA0A6'}
            style={styles.icon}
          />
          <Text
            variant="body"
            style={[
              styles.chipText,
              showEvents ? styles.chipTextActive : styles.chipTextInactive,
            ]}
          >
            Événements
          </Text>
          <View
            style={[
              styles.badge,
              showEvents ? styles.badgeActiveEvent : styles.badgeInactive,
            ]}
          >
            <Text
              variant="caption"
              style={[
                styles.badgeText,
                showEvents ? styles.badgeTextActive : styles.badgeTextInactive,
              ]}
            >
              {eventsCount}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
    backgroundColor: '#F8F9FA',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: '#E8F0FE',
    borderColor: '#4285F4',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  checkIcon: {
    marginRight: 3,
  },
  icon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  chipTextActive: {
    color: '#202124',
  },
  chipTextInactive: {
    color: '#5F6368',
  },
  badge: {
    minWidth: 22,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeActive: {
    backgroundColor: '#4285F4',
  },
  badgeActiveEvent: {
    backgroundColor: '#EA4335',
  },
  badgeInactive: {
    backgroundColor: '#E8EAED',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  badgeTextInactive: {
    color: '#5F6368',
  },
});

export default FilterChips;
