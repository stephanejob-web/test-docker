/**
 * Calendar Utility Functions
 * Add events to device calendar
 */

import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  url?: string;
}

/**
 * Request calendar permissions
 */
export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status === 'granted') {
      return true;
    } else {
      Alert.alert(
        'Permission refusée',
        'Veuillez autoriser l\'accès au calendrier dans les paramètres pour ajouter des événements.',
        [{ text: 'OK' }]
      );
      return false;
    }
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
}

/**
 * Get default calendar ID
 */
async function getDefaultCalendarId(): Promise<string | null> {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

    if (calendars.length === 0) {
      return null;
    }

    // Try to find default calendar
    let defaultCalendar = calendars.find(
      cal => cal.source.name === 'Default' || cal.isPrimary
    );

    // Fallback to first available calendar
    if (!defaultCalendar) {
      defaultCalendar = calendars[0];
    }

    return defaultCalendar.id;
  } catch (error) {
    console.error('Error getting calendars:', error);
    return null;
  }
}

/**
 * Add event to calendar
 */
export async function addEventToCalendar(event: CalendarEvent): Promise<boolean> {
  try {
    // Request permissions
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return false;
    }

    // Get default calendar
    const calendarId = await getDefaultCalendarId();
    if (!calendarId) {
      Alert.alert(
        'Erreur',
        'Impossible de trouver un calendrier sur votre appareil.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Create event
    const eventDetails = {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location || '',
      notes: event.notes || '',
      timeZone: 'Europe/Paris',
      alarms: [
        { relativeOffset: -60 }, // 1 hour before
        { relativeOffset: -1440 }, // 1 day before
      ],
    } as Calendar.Event;

    // Add URL if available (works on iOS)
    // Type assertion needed because url is an iOS-only property
    if (Platform.OS === 'ios' && event.url) {
      const eventWithUrl = eventDetails as Calendar.Event & { url?: string };
      eventWithUrl.url = event.url;
    }

    const eventId = await Calendar.createEventAsync(calendarId, eventDetails);

    if (eventId) {
      Alert.alert(
        'Événement ajouté! ✓',
        `L'événement a été ajouté à votre calendrier.`,
        [{ text: 'OK' }]
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    Alert.alert(
      'Erreur',
      'Impossible d\'ajouter l\'événement au calendrier.',
      [{ text: 'OK' }]
    );
    return false;
  }
}
