/**
 * Push Notification Service
 * Gère les notifications push via Expo Notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/axios';

const DEVICE_ID_KEY = '@light_church:device_id';
const PUSH_TOKEN_KEY = '@light_church:push_token';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Demande la permission pour les notifications push
 */
export async function requestPushPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification');
    return false;
  }

  return true;
}

/**
 * Obtient le token push Expo et l'enregistre sur le serveur
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Vérifier les permissions
    const hasPermission = await requestPushPermissions();
    if (!hasPermission) {
      return null;
    }

    // Obtenir le token Expo
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id',
    });
    const expoPushToken = tokenData.data;

    // Générer ou récupérer le device_id
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    // Enregistrer sur le serveur
    await api.post('/public/push-tokens', {
      device_id: deviceId,
      push_token: expoPushToken,
      platform: Platform.OS,
    });

    // Sauvegarder localement
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, expoPushToken);

    console.log('Push notification registered:', { deviceId, expoPushToken });

    return deviceId;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Récupère le device_id stocké localement
 * Si aucun device_id n'existe, en crée un pour permettre le tracking sans notifications
 */
export async function getDeviceId(): Promise<string | null> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    // Si pas de device_id, en créer un (permet de fonctionner sans notifications dans Expo Go)
    if (!deviceId) {
      deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      console.log('Created device_id without notifications:', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a accepté les notifications
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Configure le canal Android pour les notifications
 * Requis pour Android 8.0+
 */
export async function setupAndroidNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4285F4',
      sound: 'default',
    });
  }
}
