import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInterestedEventsCount } from '@/hooks/query/useInterestedEvents';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Get saved events count for badge (updates in real-time)
  const { data: savedCount = 0 } = useInterestedEventsCount();

  // Google Maps style colors
  const activeColor = '#4285F4'; // Google Blue
  const inactiveColor = '#5F6368'; // Gray

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8EAED',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      {/* Découvrir - Main Map Screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Découvrir',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Enregistrés - Saved/Favorites */}
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Enregistrés',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarBadge: savedCount > 0 ? savedCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#EA4335', // Google Red
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: '600',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            top: 2,
          },
        }}
      />

      {/* À propos - Privacy Policy & Info */}
      <Tabs.Screen
        name="about"
        options={{
          title: 'À propos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'information-circle' : 'information-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hide old explore tab */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );
}
