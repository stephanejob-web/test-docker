/**
 * Saved/Favorites Screen
 * Placeholder for future feature: saved churches and events
 * Google Maps style
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box, Text } from '@/components/ui';

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Box
        padding="l"
        backgroundColor="surface"
        borderBottomWidth={1}
        borderBottomColor="border"
      >
        <Text variant="header" style={styles.headerText}>
          Enregistrés
        </Text>
        <Text variant="caption" color="textSecondary" marginTop="xs">
          Vos églises et événements favoris
        </Text>
      </Box>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Box alignItems="center" justifyContent="center" paddingVertical="xl">
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="bookmark-outline" size={64} color="#DADCE0" />
          </View>

          {/* Title */}
          <Text variant="subtitle" style={styles.title}>
            Aucun favori enregistré
          </Text>

          {/* Description */}
          <Text
            variant="body"
            color="textSecondary"
            textAlign="center"
            style={styles.description}
          >
            Vous pourrez bientôt enregistrer vos églises et événements préférés pour
            y accéder rapidement.
          </Text>

          {/* Future feature hint */}
          <Box
            marginTop="xl"
            padding="m"
            backgroundColor="background"
            borderRadius="m"
            style={styles.hintBox}
          >
            <View style={styles.hintRow}>
              <Ionicons name="information-circle-outline" size={20} color="#5F6368" />
              <Text variant="caption" color="textSecondary" style={styles.hintText}>
                Fonctionnalité à venir
              </Text>
            </View>
            <Text variant="caption" color="textSecondary" marginTop="xs">
              Appuyez sur l'icône ⭐ sur une église ou un événement pour l'ajouter à vos
              favoris.
            </Text>
          </Box>
        </Box>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#202124',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
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
  description: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
  },
  hintBox: {
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintText: {
    marginLeft: 8,
    fontWeight: '600',
  },
});
