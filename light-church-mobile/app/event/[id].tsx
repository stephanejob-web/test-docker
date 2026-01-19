/**
 * Event Detail Page
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, Linking, Image, Alert, RefreshControl, TouchableOpacity, View, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Box, Text, Card } from '@/components/ui';
import { useEventDetail, useIsInterested, useToggleEventInterest } from '@/hooks/query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { addEventToCalendar } from '@/utils/calendar';
import { registerForPushNotifications, hasNotificationPermission } from '@/services/pushNotificationService';
import { useToast } from '@/contexts/ToastContext';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const eventId = Number(id);
  const { data, isLoading, error, refetch } = useEventDetail(eventId);
  const { data: interestData, refetch: refetchInterest } = useIsInterested(eventId);
  const toggleInterest = useToggleEventInterest(eventId);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isInterested = interestData?.is_interested || false;
  const interestedCount = data?.event?.interested_count || 0;
  const isCancelled = Boolean(data?.event?.cancelled_at);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleOpenMaps = () => {
    if (!data?.event) return;
    const { latitude, longitude } = data.event;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleRegister = () => {
    if (!data?.event?.details?.registration_link) return;
    Linking.openURL(data.event.details.registration_link);
  };

  const handleEmail = () => {
    if (!data?.event?.pastor_email) return;
    Linking.openURL(`mailto:${data.event.pastor_email}`);
  };

  const handleChurchPhone = () => {
    if (!data?.event?.church?.details?.phone) return;
    Linking.openURL(`tel:${data.event.church.details.phone}`);
  };

  const handleAddToCalendar = async () => {
    if (!data?.event) return;

    setIsAddingToCalendar(true);
    try {
      const event = data.event;
      const startDate = new Date(event.start_datetime);
      const endDate = new Date(event.end_datetime);

      // Build location string
      let location = '';
      if (event.details?.address) {
        location = event.details.address;
        // Only add postal code and city if not already in address
        if (event.details.postal_code && event.details.city &&
            !event.details.address.includes(event.details.postal_code)) {
          location += `, ${event.details.postal_code} ${event.details.city}`;
        }
      }

      // Build notes with description and organizer info
      let notes = '';
      if (event.details?.description) {
        notes += event.details.description + '\n\n';
      }
      if (event.church?.church_name) {
        notes += `Organisé par: ${event.church.church_name}\n`;
      }
      if (event.pastor_first_name || event.pastor_last_name) {
        notes += `Contact: ${event.pastor_first_name} ${event.pastor_last_name}\n`;
      }
      if (event.pastor_email) {
        notes += `Email: ${event.pastor_email}\n`;
      }

      await addEventToCalendar({
        title: event.title,
        startDate,
        endDate,
        location,
        notes: notes.trim(),
        url: event.details?.registration_link || undefined,
      });
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        refetchInterest()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleInterest = async () => {
    try {
      // Vérifier si les notifications sont activées
      const hasPermission = await hasNotificationPermission();

      if (!hasPermission && !isInterested) {
        // Demander l'autorisation si pas encore intéressé
        Alert.alert(
          'Notifications requises',
          'Pour participer et recevoir des notifications sur cet événement, vous devez activer les notifications push.',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Activer',
              onPress: async () => {
                const deviceId = await registerForPushNotifications();
                if (deviceId) {
                  // Confirmation de participation après activation notifications
                  confirmParticipation(deviceId);
                } else {
                  toast.showError(
                    'Impossible d\'activer les notifications. Veuillez vérifier les paramètres de votre appareil.'
                  );
                }
              },
            },
          ]
        );
        return;
      }

      // Si l'utilisateur veut retirer sa participation
      if (isInterested) {
        Alert.alert(
          'Ne plus participer',
          `L'église compte sur votre présence. Êtes-vous certain de ne plus participer ?`,
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Ne plus participer',
              style: 'destructive',
              onPress: () => {
                toggleInterest.mutate(isInterested, {
                  onSuccess: () => {
                    toast.showInfo('Vous ne recevrez plus de notifications pour cet événement');
                  },
                  onError: handleToggleError,
                });
              },
            },
          ]
        );
      } else {
        // Confirmation de participation
        confirmParticipation();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.showError(message);
    }
  };

  const confirmParticipation = (deviceId?: string) => {
    Alert.alert(
      'Confirmer votre participation',
      'En participant, vous indiquez votre intention d\'assister à cet événement. L\'église compte sur vous !',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Je participe',
          onPress: () => {
            toggleInterest.mutate(isInterested, {
              onSuccess: (data) => {
                toast.showSuccess(
                  `Participation confirmée ! ${data.interested_count} ${data.interested_count === 1 ? 'participant' : 'participants'}.`
                );
              },
              onError: handleToggleError,
            });
          },
        },
      ]
    );
  };

  const handleToggleError = (error: unknown) => {
    let errorMessage = 'Une erreur est survenue lors de l\'enregistrement';

    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      errorMessage = response?.data?.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    toast.showError(errorMessage, {
      label: 'Réessayer',
      onPress: () => handleToggleInterest(),
    });
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="background">
        <ActivityIndicator size="large" color="#4285F4" />
      </Box>
    );
  }

  if (error || !data?.event) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="background" padding="m">
        <Text variant="body" color="error">
          Erreur lors du chargement de l'événement
        </Text>
      </Box>
    );
  }

  const event = data.event;
  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);

  // Vérifier si l'événement dure plusieurs jours
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  // Formater l'affichage des dates selon la durée
  const formatEventDates = () => {
    if (isSameDay) {
      // Événement d'une journée : "Vendredi 6 mars • 07:00 - 18:00"
      return `${format(startDate, 'EEEE d MMMM', { locale: fr })} • ${format(startDate, 'HH:mm', { locale: fr })} - ${format(endDate, 'HH:mm', { locale: fr })}`;
    } else {
      // Événement multi-jours : "Du ven. 6 mars 07:00 au dim. 8 mars 18:00"
      return `Du ${format(startDate, 'EEE d MMM', { locale: fr })} ${format(startDate, 'HH:mm', { locale: fr })} au ${format(endDate, 'EEE d MMM', { locale: fr })} ${format(endDate, 'HH:mm', { locale: fr })}`;
    }
  };

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
      {/* Image */}
      {event.details?.image_url && (
        <Image
          source={{ uri: event.details.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Header */}
      <Box padding="m">
        <Text variant="header" marginBottom="s">
          {event.title}
        </Text>

        {/* Badge ANNULÉ (Google Maps style) */}
        {isCancelled && (
          <Box
            backgroundColor="error"
            paddingHorizontal="m"
            paddingVertical="s"
            borderRadius="s"
            alignSelf="flex-start"
            marginBottom="m"
          >
            <Text variant="body" fontWeight="700" style={{ color: '#FFFFFF' }}>
              ❌ ÉVÉNEMENT ANNULÉ
            </Text>
          </Box>
        )}

        {/* Raison d'annulation */}
        {isCancelled && event.cancellation_reason && (
          <Box
            backgroundColor="card"
            padding="m"
            borderRadius="m"
            marginBottom="m"
            style={{ borderLeftWidth: 4, borderLeftColor: '#EA4335' }}
          >
            <Box flexDirection="row" alignItems="center" marginBottom="xs">
              <Ionicons name="information-circle" size={18} color="#EA4335" />
              <Text variant="subtitle" fontWeight="700" marginLeft="xs" style={{ color: '#EA4335' }}>
                Raison de l'annulation
              </Text>
            </Box>
            <Text variant="body" color="textSecondary">
              {event.cancellation_reason}
            </Text>
          </Box>
        )}

        {event.denomination_name && (
          <Text variant="body" color="primary" marginBottom="s">
            {event.denomination_name}
          </Text>
        )}

        <Box flexDirection="row" alignItems="center" marginTop="s" marginBottom="s">
          {/* Date Badge */}
          <Box
            width={isSameDay ? 56 : 70}
            height={56}
            borderRadius="l"
            backgroundColor="card"
            justifyContent="center"
            alignItems="center"
            marginRight="m"
            borderWidth={1}
            borderColor="border"
          >
            <Text variant="small" color="error" fontWeight="700" textTransform="uppercase" fontSize={10}>
              {format(startDate, 'MMM', { locale: fr }).toUpperCase()}
            </Text>
            <Text variant="title" color="text" fontWeight="700" fontSize={isSameDay ? 22 : 18} lineHeight={isSameDay ? 26 : 22}>
              {isSameDay
                ? format(startDate, 'dd', { locale: fr })
                : `${format(startDate, 'd', { locale: fr })}-${format(endDate, 'd', { locale: fr })}`
              }
            </Text>
          </Box>

          <Box flex={1}>
            <Box flexDirection="row" alignItems="center" gap="xs" marginBottom="xs" flex={1}>
              <Ionicons name="time-outline" size={16} color="#5F6368" />
              <Text variant="body" color="textSecondary" style={{ flex: 1 }}>
                {formatEventDates()}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Ionicons name="location-outline" size={16} color="#5F6368" />
              <Text variant="body" color="textSecondary" numberOfLines={1}>
                {event.details?.city || event.church?.city || 'Lieu à confirmer'}
              </Text>
            </Box>
          </Box>
        </Box>

        <Box flexDirection="row" alignItems="center" gap="s" flexWrap="wrap" marginTop="s">
          {event.details?.is_free === 1 && (
            <Text variant="body" color="success" fontWeight="600">
              ✓ Gratuit
            </Text>
          )}
          {event.primary_language_flag && event.primary_language_name && (
            <Text variant="body" color="textSecondary">
              {event.primary_language_flag} {event.primary_language_name}
              {event.translations && event.translations.length > 0 && (
                <Text color="textTertiary">
                  {' (Traduit en : '}
                  {event.translations.map((t, index) => {
                    // EventTranslation type already defined, use it directly
                    const name = t.language_name;
                    const flag = t.language_flag || '';

                    if (!name) return null;

                    return (
                      <Text key={t.language_id || index}>
                        {index > 0 ? ', ' : ''}
                        {flag ? `${flag} ` : ''}{name}
                      </Text>
                    );
                  })}
                  {')'}
                </Text>
              )}
            </Text>
          )}
        </Box>
      </Box>

      {/* Participants Count Badge */}
      {interestedCount > 0 && (
        <Box paddingHorizontal="m" marginBottom="s">
          <Box
            backgroundColor="primary"
            paddingHorizontal="m"
            paddingVertical="s"
            borderRadius="m"
            alignSelf="flex-start"
            flexDirection="row"
            alignItems="center"
            gap="xs"
          >
            <Ionicons name="people" size={16} color="#FFFFFF" />
            <Text variant="caption" color="textInverse" fontWeight="600">
              {interestedCount} {interestedCount === 1 ? 'participant' : 'participants'}
            </Text>
          </Box>
        </Box>
      )}

      {/* Actions - Google Maps iOS Style */}
      <View style={buttonStyles.container}>
        {/* Participation Button - Full Width Primary */}
        <TouchableOpacity
          style={[
            buttonStyles.button,
            isCancelled ? buttonStyles.buttonDisabled : (isInterested ? buttonStyles.buttonSecondary : buttonStyles.buttonPrimary),
            toggleInterest.isPending && buttonStyles.buttonDisabled
          ]}
          onPress={handleToggleInterest}
          disabled={isCancelled || toggleInterest.isPending}
          activeOpacity={isCancelled ? 1 : 0.8}
        >
          {isCancelled ? (
            <Ionicons
              name="close-circle"
              size={20}
              color="#9CA3AF"
              style={buttonStyles.icon}
            />
          ) : toggleInterest.isPending ? (
            <ActivityIndicator size="small" color={isInterested ? "#4285F4" : "#FFFFFF"} style={buttonStyles.icon} />
          ) : (
            <Ionicons
              name={isInterested ? "checkmark-circle" : "person-add"}
              size={20}
              color={isInterested ? "#4285F4" : "#FFFFFF"}
              style={buttonStyles.icon}
            />
          )}
          <Text style={[buttonStyles.buttonText, isCancelled ? buttonStyles.buttonTextDisabled : (isInterested ? buttonStyles.buttonTextSecondary : buttonStyles.buttonTextPrimary)]}>
            {isCancelled ? 'Événement annulé' : (isInterested ? 'Ne plus participer' : 'Je participe')}
          </Text>
        </TouchableOpacity>

        {/* Primary Actions Row */}
        <View style={buttonStyles.row}>
          <TouchableOpacity
            style={[buttonStyles.button, buttonStyles.buttonPrimary, buttonStyles.buttonHalf]}
            onPress={handleAddToCalendar}
            disabled={isAddingToCalendar}
            activeOpacity={0.8}
          >
            {isAddingToCalendar ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={buttonStyles.icon} />
            ) : (
              <Ionicons name="calendar" size={20} color="#FFFFFF" style={buttonStyles.icon} />
            )}
            <Text style={buttonStyles.buttonTextPrimary}>Calendrier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.button, buttonStyles.buttonSecondary, buttonStyles.buttonHalf]}
            onPress={handleOpenMaps}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={20} color="#4285F4" style={buttonStyles.icon} />
            <Text style={buttonStyles.buttonTextSecondary}>Itinéraire</Text>
          </TouchableOpacity>
        </View>

        {/* Registration Button */}
        {event.details?.registration_link && (
          <TouchableOpacity
            style={[buttonStyles.button, buttonStyles.buttonSecondary]}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={20} color="#4285F4" style={buttonStyles.icon} />
            <Text style={buttonStyles.buttonTextSecondary}>S'inscrire à l'événement</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      {event.details?.description && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Description
          </Text>
          <Text
            variant="body"
            color="textSecondary"
            numberOfLines={isDescriptionExpanded ? undefined : 4}
          >
            {event.details.description}
          </Text>
          {event.details.description.length > 200 && (
            <TouchableOpacity
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              style={{ marginTop: 12 }}
              activeOpacity={0.7}
            >
              <Text variant="body" color="primary" fontWeight="600">
                {isDescriptionExpanded ? '▲ Voir moins' : '▼ Lire plus'}
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      )}

      {/* Organizer Contact */}
      {(event.organizer_name || event.pastor_email || event.pastor_first_name || event.pastor_last_name) && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Contact Organisateur
          </Text>

          <Box gap="m">
            {/* Organizer Name */}
            {event.organizer_name && (
              <Box flexDirection="row" gap="m">
                <Ionicons name="business-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
                <Box flex={1}>
                  <Text variant="body">{event.organizer_name}</Text>
                  <Text variant="caption" color="textSecondary">
                    Organisateur
                  </Text>
                </Box>
              </Box>
            )}

            {/* Pastor */}
            {(event.pastor_first_name || event.pastor_last_name) && (
              <Box flexDirection="row" gap="m">
                <Ionicons name="person-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
                <Box flex={1}>
                  <Text variant="body">
                    {event.pastor_first_name} {event.pastor_last_name}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Pasteur responsable
                  </Text>
                </Box>
              </Box>
            )}

            {/* Email */}
            {event.pastor_email && (
              <Box flexDirection="row" gap="m">
                <Ionicons name="mail-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
                <Box flex={1}>
                  <Text variant="body" color="primary" onPress={handleEmail}>
                    {event.pastor_email}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
        </Card>
      )}

      {/* Details - Google Maps Style */}
      <Card marginHorizontal="m" marginBottom="m">
        <Text variant="subtitle" marginBottom="m">
          Détails de l'événement
        </Text>

        <Box gap="m">
          {/* Speaker */}
          {event.details?.speaker_name && (
            <Box flexDirection="row" gap="m">
              <Ionicons name="mic-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
              <Box flex={1}>
                <Text variant="body">{event.details.speaker_name}</Text>
                <Text variant="caption" color="textSecondary">
                  Intervenant
                </Text>
              </Box>
            </Box>
          )}

          {/* Seats */}
          {event.details?.max_seats && (
            <Box flexDirection="row" gap="m">
              <Ionicons name="ticket-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
              <Box flex={1}>
                <Text variant="body">{event.details.max_seats} places</Text>
                <Text variant="caption" color="textSecondary">
                  Places disponibles
                </Text>
              </Box>
            </Box>
          )}

          {/* Location & Map */}
          {event.details?.address && (
            <Box flexDirection="row" gap="m">
              <Ionicons name="location-outline" size={20} color="#5F6368" style={{ marginTop: 2 }} />
              <Box flex={1}>
                <Text variant="body">
                  {event.details.address}
                  {/* Only show postal code and city if not already in address */}
                  {event.details.postal_code && event.details.city &&
                   !event.details.address?.includes(event.details.postal_code) && (
                    <>
                      {'\n'}
                      {event.details.postal_code} {event.details.city}
                    </>
                  )}
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
                      latitude: event.latitude,
                      longitude: event.longitude,
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
                      coordinate={{ latitude: event.latitude, longitude: event.longitude }}
                      pinColor="#EA4335"
                    />
                  </MapView>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Card>

      {/* Church Info - Link Only */}
      {event.church && (
        <Card marginHorizontal="m" marginBottom="m">
          <TouchableOpacity
            onPress={() => router.push(`/church/${event.church!.id}`)}
            activeOpacity={0.7}
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Box flex={1}>
                <Text variant="subtitle" marginBottom="xs">Organisé par</Text>
                <Text variant="body" fontWeight="600" color="primary">
                  {event.church.church_name}
                </Text>
                {event.church.denomination_name && (
                  <Text variant="caption" color="textSecondary">
                    {event.church.denomination_name}
                  </Text>
                )}
                <Text variant="caption" color="textTertiary" marginTop="s">
                  Voir le profil complet de l'église, ses horaires et son adresse.
                </Text>
              </Box>
              <Ionicons name="chevron-forward" size={24} color="#4285F4" />
            </Box>
          </TouchableOpacity>
        </Card>
      )}

      {/* Parking */}
      {event.details?.has_parking === 1 && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Parking
          </Text>
          <Text variant="body" color="textSecondary">
            {event.details.parking_capacity ? `${event.details.parking_capacity} places` : 'Disponible'}
            {event.details.is_parking_free === 1 && ' • Gratuit'}
          </Text>
          {event.details.parking_details && (
            <Text variant="caption" color="textTertiary" marginTop="s">
              {event.details.parking_details}
            </Text>
          )}
        </Card>
      )}



      {/* YouTube Live */}
      {event.details?.youtube_live && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Diffusion en direct
          </Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            onPress={() => Linking.openURL(event.details!.youtube_live!)}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-youtube" size={20} color="#4285F4" />
            <Text variant="body" color="primary">
              Regarder sur YouTube
            </Text>
          </TouchableOpacity>
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
  image: {
    width: '100%',
    height: 250,
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
  buttonDisabled: {
    backgroundColor: '#F1F3F4',
    opacity: 0.8,
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
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#4285F4',
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
});
