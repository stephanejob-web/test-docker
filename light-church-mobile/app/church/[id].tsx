/**
 * Church Detail Page
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, Linking, RefreshControl, TouchableOpacity, View, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Box, Text, Card } from '@/components/ui';
import { useChurchDetail } from '@/hooks/query';

export default function ChurchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch } = useChurchDetail(Number(id));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleOpenMaps = () => {
    if (!data?.church) return;
    const { latitude, longitude } = data.church;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    if (!data?.church?.details?.phone) return;
    Linking.openURL(`tel:${data.church.details.phone}`);
  };

  const handleWebsite = () => {
    if (!data?.church?.details?.website) return;
    Linking.openURL(data.church.details.website);
  };

  const handleEmail = () => {
    if (!data?.church?.email) return;
    Linking.openURL(`mailto:${data.church.email}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="background">
        <ActivityIndicator size="large" color="#4285F4" />
      </Box>
    );
  }

  if (error || !data?.church) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="background" padding="m">
        <Text variant="body" color="error">
          Erreur lors du chargement des détails
        </Text>
      </Box>
    );
  }

  const church = data.church;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#4285F4"
          colors={["#4285F4"]}
        />
      }
    >
      {/* Header */}
      <Box padding="m" flexDirection="row" alignItems="center">
        <Box
          width={64}
          height={64}
          borderRadius="l"
          backgroundColor="card"
          justifyContent="center"
          alignItems="center"
          marginRight="m"
          borderWidth={1}
          borderColor="border"
        >
          <Ionicons name="business" size={32} color="#4285F4" />
        </Box>
        <Box flex={1}>
          <Text variant="header" marginBottom="xs">
            {church.church_name}
          </Text>
          <Text variant="body" color="primary" fontWeight="500">
            {church.denomination_name}
          </Text>
        </Box>
      </Box>

      {/* Actions - Google Maps iOS Style */}
      <View style={buttonStyles.container}>
        <View style={buttonStyles.row}>
          <TouchableOpacity
            style={[buttonStyles.button, buttonStyles.buttonPrimary, buttonStyles.buttonHalf]}
            onPress={handleOpenMaps}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={20} color="#FFFFFF" style={buttonStyles.icon} />
            <Text style={buttonStyles.buttonTextPrimary}>Itinéraire</Text>
          </TouchableOpacity>

          {church.details?.phone && (
            <TouchableOpacity
              style={[buttonStyles.button, buttonStyles.buttonSecondary, buttonStyles.buttonHalf]}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={20} color="#4285F4" style={buttonStyles.icon} />
              <Text style={buttonStyles.buttonTextSecondary}>Appeler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info Card - Google Maps Style */}
      <Card marginHorizontal="m" marginBottom="m">
        <Text variant="subtitle" marginBottom="m">
          Informations
        </Text>

        <Box gap="m">
          {/* Pastor */}
          {(church.details?.pastor_first_name || church.details?.pastor_last_name) && (
            <Box flexDirection="row" gap="m">
              <Ionicons name="person-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
              <Box flex={1}>
                <Text variant="body">
                  {church.details.pastor_first_name} {church.details.pastor_last_name}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Pasteur
                </Text>
              </Box>
            </Box>
          )}

          {/* Address */}
          {church.details?.address && (
            <Box flexDirection="row" gap="m">
              <Ionicons name="location-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
              <Box flex={1}>
                <Text variant="body">
                  {church.details.address}
                  {'\n'}
                  {church.details.postal_code} {church.details.city}
                </Text>

                {/* Mini Map */}
                <Box
                  height={150}
                  borderRadius="m"
                  overflow="hidden"
                  marginTop="m"
                  borderWidth={1}
                  borderColor="border"
                >
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: church.latitude,
                      longitude: church.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                    liteMode={Platform.OS === 'android'}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    onPress={handleOpenMaps}
                  >
                    <Marker
                      coordinate={{ latitude: church.latitude, longitude: church.longitude }}
                      pinColor="#EA4335"
                    />
                  </MapView>
                </Box>
              </Box>
            </Box>
          )}

          {/* Phone */}
          {church.details?.phone && (
            <Box flexDirection="row" gap="m">
              <Ionicons name="call-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
              <Box flex={1}>
                <Text variant="body" color="primary" onPress={handleCall}>
                  {church.details.phone}
                </Text>
              </Box>
            </Box>
          )}

          {/* Email */}
          {church.email && (
            <Box flexDirection="row" gap="m">
              <Ionicons name="mail-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
              <Box flex={1}>
                <Text variant="body" color="primary" onPress={handleEmail}>
                  {church.email}
                </Text>
              </Box>
            </Box>
          )}

          {/* Website */}
          {church.details?.website && (
            <Box flexDirection="row" gap="m">
              <Ionicons name="globe-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
              <Box flex={1}>
                <Text variant="body" color="primary" onPress={handleWebsite}>
                  {church.details.website}
                </Text>
              </Box>
            </Box>
          )}

          {/* Status */}
          {church.details?.status && (
            <Box flexDirection="row" gap="m">
              <Ionicons name="information-circle-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
              <Box flex={1}>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Text variant="body" color={church.details.status === 'ACTIVE' ? 'success' : 'textSecondary'}>
                    {church.details.status === 'ACTIVE' ? 'Active' : church.details.status}
                  </Text>
                  {church.details.status === 'ACTIVE' && (
                    <Ionicons name="checkmark-circle" size={16} color="#34A853" />
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Card>

      {/* Schedules */}
      {church.schedules && church.schedules.length > 0 && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Horaires
          </Text>
          {church.schedules.map((schedule, index) => (
            <Box
              key={index}
              flexDirection="row"
              justifyContent="space-between"
              marginBottom="s"
              paddingBottom="s"
              borderBottomWidth={index < church.schedules.length - 1 ? 1 : 0}
              borderBottomColor="border"
            >
              <Box>
                <Text variant="body">{schedule.day_of_week}</Text>
                <Text variant="caption" color="textSecondary">
                  {schedule.activity_type}
                </Text>
              </Box>
              <Text variant="body" fontWeight="600">
                {schedule.start_time.slice(0, 5)}
              </Text>
            </Box>
          ))}
        </Card>
      )}

      {/* Description */}
      {church.details?.description && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            À propos
          </Text>
          <Text variant="body" color="textSecondary">
            {church.details.description}
          </Text>
        </Card>
      )}

      {/* Parking */}
      {church.details?.has_parking === 1 && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Parking
          </Text>
          <Text variant="body" color="textSecondary">
            {church.details.parking_capacity ? `${church.details.parking_capacity} places` : 'Disponible'}
            {church.details.is_parking_free === 1 && ' • Gratuit'}
          </Text>
        </Card>
      )}

      {/* Social Media - Enhanced with Icons */}
      {church.socials && church.socials.length > 0 && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Réseaux sociaux
          </Text>
          <Box gap="m">
            {church.socials.map((social, index) => {
              // Détecter la plateforme et définir l'icône et la couleur basé sur social.platform
              let iconName: keyof typeof Ionicons.glyphMap = 'link-outline';
              let iconColor = '#4285F4';

              const platform = social.platform.toUpperCase();

              if (platform === 'FACEBOOK') {
                iconName = 'logo-facebook';
                iconColor = '#1877F2';
              } else if (platform === 'INSTAGRAM') {
                iconName = 'logo-instagram';
                iconColor = '#E4405F';
              } else if (platform === 'YOUTUBE') {
                iconName = 'logo-youtube';
                iconColor = '#FF0000';
              } else if (platform === 'TWITTER' || platform === 'X') {
                iconName = 'logo-twitter';
                iconColor = '#1DA1F2';
              } else if (platform === 'TIKTOK') {
                iconName = 'logo-tiktok';
                iconColor = '#000000';
              } else if (platform === 'LINKEDIN') {
                iconName = 'logo-linkedin';
                iconColor = '#0A66C2';
              } else if (platform === 'WHATSAPP') {
                iconName = 'logo-whatsapp';
                iconColor = '#25D366';
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => Linking.openURL(social.url)}
                  activeOpacity={0.7}
                >
                  <Box flexDirection="row" alignItems="center" gap="m">
                    <Box
                      width={40}
                      height={40}
                      borderRadius="l"
                      backgroundColor="card"
                      justifyContent="center"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="border"
                    >
                      <Ionicons name={iconName} size={22} color={iconColor} />
                    </Box>
                    <Box flex={1}>
                      <Text variant="body" fontWeight="600" color="text">
                        {social.platform}
                      </Text>
                      <Text variant="caption" color="textSecondary" numberOfLines={1}>
                        Voir le profil
                      </Text>
                    </Box>
                    <Ionicons name="chevron-forward" size={20} color="#5F6368" />
                  </Box>
                </TouchableOpacity>
              );
            })}
          </Box>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    paddingBottom: 40,
  },
});

const buttonStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonPrimary: {
    backgroundColor: '#4285F4',
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  buttonHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  icon: {
    marginRight: 8,
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4285F4',
  },
});
