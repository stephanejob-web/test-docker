/**
 * About Screen
 * Privacy Policy and App Information
 * Google Maps style
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box, Text } from '@/components/ui';

export default function AboutScreen() {
  const appVersion = '1.0.0';

  const handleOpenWebsite = () => {
    Linking.openURL('https://lightchurch.fr');
  };

  const handleOpenEmail = () => {
    Linking.openURL('mailto:contact@lightchurch.fr');
  };

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
          À propos
        </Text>
        <Text variant="caption" color="textSecondary" marginTop="xs">
          Light Church v{appVersion}
        </Text>
      </Box>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="business-outline" size={48} color="#4285F4" />
        </View>

        <Text variant="subtitle" style={styles.appName}>
          Light Church
        </Text>

        <Text variant="body" color="textSecondary" textAlign="center" style={styles.tagline}>
          Trouvez des églises et événements chrétiens près de chez vous
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenWebsite}>
            <Ionicons name="globe-outline" size={20} color="#4285F4" />
            <Text style={styles.actionText}>Site web</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleOpenEmail}>
            <Ionicons name="mail-outline" size={20} color="#4285F4" />
            <Text style={styles.actionText}>Nous contacter</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Policy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#5F6368" />
            <Text variant="subtitle" style={styles.sectionTitle}>
              Politique de confidentialité
            </Text>
          </View>

          <Text variant="body" color="textSecondary" style={styles.policyText}>
            <Text style={styles.bold}>Collecte de données{'\n'}</Text>
            Light Church collecte uniquement les données nécessaires au fonctionnement de
            l'application : votre position géographique pour afficher les églises et événements
            à proximité.
          </Text>

          <Text variant="body" color="textSecondary" style={styles.policyText}>
            <Text style={styles.bold}>Utilisation des données{'\n'}</Text>
            Vos données de localisation sont utilisées uniquement pour calculer les distances
            et ne sont jamais stockées sur nos serveurs. Aucune donnée personnelle n'est
            collectée sans votre consentement.
          </Text>

          <Text variant="body" color="textSecondary" style={styles.policyText}>
            <Text style={styles.bold}>Notifications push{'\n'}</Text>
            Si vous activez les notifications, nous stockons votre token de notification pour
            vous informer des mises à jour d'événements auxquels vous vous êtes inscrit. Vous
            pouvez désactiver les notifications à tout moment dans les paramètres de votre
            appareil.
          </Text>

          <Text variant="body" color="textSecondary" style={styles.policyText}>
            <Text style={styles.bold}>Cookies et stockage local{'\n'}</Text>
            L'application utilise le stockage local de votre appareil pour sauvegarder vos
            préférences (filtres, favoris). Ces données restent sur votre appareil et ne sont
            jamais partagées.
          </Text>

          <Text variant="body" color="textSecondary" style={styles.policyText}>
            <Text style={styles.bold}>Partage des données{'\n'}</Text>
            Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des
            tiers. Les informations publiques sur les églises et événements proviennent de
            sources publiques et de contributions vérifiées.
          </Text>

          <Text variant="body" color="textSecondary" style={styles.policyText}>
            <Text style={styles.bold}>Sécurité{'\n'}</Text>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos
            données contre tout accès non autorisé.
          </Text>

          <Text variant="body" color="textSecondary" style={styles.policyText}>
            <Text style={styles.bold}>Vos droits{'\n'}</Text>
            Conformément au RGPD, vous avez le droit d'accéder, de rectifier ou de supprimer
            vos données personnelles. Pour toute demande, contactez-nous à{' '}
            <Text style={styles.link} onPress={handleOpenEmail}>
              contact@lightchurch.fr
            </Text>
          </Text>

          <Text variant="caption" color="textSecondary" style={styles.lastUpdated}>
            Dernière mise à jour : Janvier 2026
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="caption" color="textSecondary" textAlign="center">
            © 2026 Light Church. Tous droits réservés.
          </Text>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F1F3F4',
    borderRadius: 20,
    gap: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4285F4',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#202124',
  },
  policyText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '600',
    color: '#202124',
  },
  link: {
    color: '#4285F4',
    textDecorationLine: 'underline',
  },
  lastUpdated: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
});
