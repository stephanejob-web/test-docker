/**
 * Event Detail Page
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, Linking, Image, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Box, Text, Button, Card } from '@/components/ui';
import { useEventDetail, useIsInterested, useToggleEventInterest } from '@/hooks/query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { addEventToCalendar } from '@/utils/calendar';
import { registerForPushNotifications, hasNotificationPermission } from '@/services/pushNotificationService';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const { data, isLoading, error } = useEventDetail(eventId);
  const { data: interestData } = useIsInterested(eventId);
  const toggleInterest = useToggleEventInterest(eventId);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

  const isInterested = interestData?.is_interested || false;
  const interestedCount = data?.event?.interested_count || 0;

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
        if (event.details.postal_code && event.details.city) {
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

  const handleToggleInterest = async () => {
    try {
      // Vérifier si les notifications sont activées
      const hasPermission = await hasNotificationPermission();

      if (!hasPermission && !isInterested) {
        // Demander l'autorisation si pas encore intéressé
        Alert.alert(
          'Notifications requises',
          'Pour montrer votre intérêt et recevoir des notifications sur cet événement, vous devez activer les notifications push.',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Activer',
              onPress: async () => {
                const deviceId = await registerForPushNotifications();
                if (deviceId) {
                  toggleInterest.mutate(isInterested);
                } else {
                  Alert.alert(
                    'Erreur',
                    'Impossible d\'activer les notifications. Veuillez vérifier les paramètres de votre appareil.'
                  );
                }
              },
            },
          ]
        );
        return;
      }

      // Toggle interest
      toggleInterest.mutate(isInterested, {
        onSuccess: (data) => {
          const message = isInterested
            ? 'Vous ne recevrez plus de notifications pour cet événement'
            : `Vous serez notifié des modifications de cet événement (${data.interested_count} personnes intéressées)`;
          Alert.alert('Succès', message);
        },
        onError: (error: any) => {
          console.error('Error toggling interest:', error);
          console.error('Error response:', error.response?.data);

          const errorMessage = error.response?.data?.message
            || error.message
            || 'Une erreur est survenue lors de l\'enregistrement';

          Alert.alert('Erreur', errorMessage);
        },
      });
    } catch (error: any) {
      console.error('Error toggling interest (catch):', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    }
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

        {event.denomination_name && (
          <Text variant="body" color="primary" marginBottom="s">
            {event.denomination_name}
          </Text>
        )}

        <Box flexDirection="row" alignItems="center" gap="s" flexWrap="wrap">
          <Text variant="body" color="textSecondary">
            📅 {format(startDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </Text>
          <Text variant="body" color="textSecondary">
            🕐 {format(startDate, 'HH:mm', { locale: fr })} - {format(endDate, 'HH:mm', { locale: fr })}
          </Text>
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
            </Text>
          )}
        </Box>
      </Box>

      {/* Interested Count Badge */}
      {interestedCount > 0 && (
        <Box paddingHorizontal="m" marginBottom="s">
          <Box
            backgroundColor="primary"
            paddingHorizontal="m"
            paddingVertical="s"
            borderRadius="m"
            alignSelf="flex-start"
          >
            <Text variant="caption" color="textInverse" fontWeight="600">
              👥 {interestedCount} {interestedCount === 1 ? 'personne intéressée' : 'personnes intéressées'}
            </Text>
          </Box>
        </Box>
      )}

      {/* Actions */}
      <Box paddingHorizontal="m" gap="s" marginBottom="m">
        {/* Interest Button - Full Width */}
        <Button
          onPress={handleToggleInterest}
          variant={isInterested ? "outline" : "primary"}
          size="medium"
          disabled={toggleInterest.isPending}
        >
          {toggleInterest.isPending ? '⏳ ' : isInterested ? '✓ ' : '⭐ '}
          {isInterested ? 'Ne plus suivre' : 'Ça m\'intéresse'}
        </Button>

        {/* Primary Actions Row */}
        <Box flexDirection="row" gap="s">
          <Box flex={1}>
            <Button onPress={handleAddToCalendar} variant="primary" size="medium" disabled={isAddingToCalendar}>
              {isAddingToCalendar ? '⏳' : '📅'} Ajouter au calendrier
            </Button>
          </Box>
          <Box flex={1}>
            <Button onPress={handleOpenMaps} variant="outline" size="medium">
              🚗 Itinéraire
            </Button>
          </Box>
        </Box>

        {/* Secondary Actions Row */}
        {event.details?.registration_link && (
          <Button onPress={handleRegister} variant="outline" size="medium">
            📝 S'inscrire à l'événement
          </Button>
        )}
      </Box>

      {/* Description */}
      {event.details?.description && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Description
          </Text>
          <Text variant="body" color="textSecondary">
            {event.details.description}
          </Text>
        </Card>
      )}

      {/* Organizer Contact */}
      {(event.organizer_name || event.pastor_email) && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Contact Organisateur
          </Text>

          {event.organizer_name && (
            <Box marginBottom="s">
              <Text variant="caption" color="textSecondary">
                Organisateur
              </Text>
              <Text variant="body">{event.organizer_name}</Text>
            </Box>
          )}

          {(event.pastor_first_name || event.pastor_last_name) && (
            <Box marginBottom="s">
              <Text variant="caption" color="textSecondary">
                Pasteur responsable
              </Text>
              <Text variant="body">
                {event.pastor_first_name} {event.pastor_last_name}
              </Text>
            </Box>
          )}

          {event.pastor_email && (
            <Box>
              <Text variant="caption" color="textSecondary">
                Email
              </Text>
              <Text variant="body" color="primary" onPress={handleEmail}>
                {event.pastor_email}
              </Text>
            </Box>
          )}
        </Card>
      )}

      {/* Details */}
      <Card marginHorizontal="m" marginBottom="m">
        <Text variant="subtitle" marginBottom="m">
          Détails de l'événement
        </Text>

        {event.details?.speaker_name && (
          <Box marginBottom="s">
            <Text variant="caption" color="textSecondary">
              Intervenant
            </Text>
            <Text variant="body">{event.details.speaker_name}</Text>
          </Box>
        )}

        {event.details?.max_seats && (
          <Box marginBottom="s">
            <Text variant="caption" color="textSecondary">
              Places disponibles
            </Text>
            <Text variant="body">{event.details.max_seats} personnes</Text>
          </Box>
        )}

        {event.details?.address && (
          <Box>
            <Text variant="caption" color="textSecondary">
              Lieu
            </Text>
            <Text variant="body">
              {event.details.address}
              {'\n'}
              {event.details.postal_code} {event.details.city}
            </Text>
          </Box>
        )}
      </Card>

      {/* Church Info */}
      {event.church && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Organisé par
          </Text>

          <Text variant="body" fontWeight="600" marginBottom="xs">
            {event.church.church_name}
          </Text>

          {event.church.denomination_name && (
            <Text variant="caption" color="primary" marginBottom="s">
              {event.church.denomination_name}
            </Text>
          )}

          {(event.church.details?.pastor_first_name || event.church.details?.pastor_last_name) && (
            <Box marginBottom="s">
              <Text variant="caption" color="textSecondary">
                Pasteur
              </Text>
              <Text variant="body">
                {event.church.details.pastor_first_name} {event.church.details.pastor_last_name}
              </Text>
            </Box>
          )}

          {event.church.details?.phone && (
            <Box marginBottom="s">
              <Text variant="caption" color="textSecondary">
                Téléphone de l'église
              </Text>
              <Text variant="body" color="primary" onPress={handleChurchPhone}>
                {event.church.details.phone}
              </Text>
            </Box>
          )}

          {event.church.details?.address && (
            <Box>
              <Text variant="caption" color="textSecondary">
                Adresse de l'église
              </Text>
              <Text variant="body">
                {event.church.details.address}
                {'\n'}
                {event.church.details.postal_code} {event.church.details.city}
              </Text>
            </Box>
          )}
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

      {/* Church Schedules */}
      {event.church?.schedules && event.church.schedules.length > 0 && (
        <Card marginHorizontal="m" marginBottom="m">
          <Text variant="subtitle" marginBottom="m">
            Horaires de l'église
          </Text>
          {event.church.schedules.slice(0, 3).map((schedule, index) => (
            <Box
              key={index}
              flexDirection="row"
              justifyContent="space-between"
              marginBottom="s"
              paddingBottom="s"
              borderBottomWidth={index < Math.min(event.church!.schedules.length, 3) - 1 ? 1 : 0}
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
          {event.church.schedules.length > 3 && (
            <Text variant="caption" color="textSecondary" marginTop="s">
              + {event.church.schedules.length - 3} autres horaires
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
          <Text
            variant="body"
            color="primary"
            onPress={() => Linking.openURL(event.details!.youtube_live!)}
          >
            📺 Regarder sur YouTube
          </Text>
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
