import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

import { profileService } from './profileService';

// ── In-app notification store ──────────────────────────────────────────────────
// Keeps received notifications in memory for the notifications screen.
// Subscribers are notified whenever the list changes.

export type InAppNotification = {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  receivedAt: Date;
  read: boolean;
};

let receivedNotifications: InAppNotification[] = [];
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function subscribeToNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotifications(): InAppNotification[] {
  return receivedNotifications;
}

export function markNotificationRead(id: string): void {
  const n = receivedNotifications.find((item) => item.id === id);
  if (n) {
    n.read = true;
    notifyListeners();
  }
}

export function markAllRead(): void {
  receivedNotifications.forEach((n) => { n.read = true; });
  notifyListeners();
}

function addNotification(notification: InAppNotification): void {
  receivedNotifications = [notification, ...receivedNotifications];
  notifyListeners();
}

// ── Notification service ───────────────────────────────────────────────────────

export const notificationService = {
  /**
   * Requests permissions and retrieves an Expo Push Token.
   * Returns the token string (e.g. "ExponentPushToken[xxx]") or null.
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Must use physical device for Push Notifications');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.error('Expo project ID not found — cannot get push token');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      return tokenData.data; // e.g. "ExponentPushToken[xxxxx]"
    } catch (error) {
      console.error('Error fetching Expo push token:', error);
      return null;
    }
  },

  /**
   * Sends the Expo push token to the backend for storage.
   */
  async savePushTokenToBackend(token: string): Promise<void> {
    try {
      await profileService.registerPushToken(token);
    } catch (error) {
      console.error('Failed to save push token to backend:', error);
    }
  },

  /**
   * Sets up foreground + tap listeners using expo-notifications.
   * Returns a cleanup function.
   */
  setupNotificationListeners(): () => void {
    // Fires when a notification is received while the app is in the foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body, data } = notification.request.content;
        addNotification({
          id: notification.request.identifier,
          title: title ?? 'ScholarLink',
          body: body ?? '',
          data: data as Record<string, unknown> | undefined,
          receivedAt: new Date(),
          read: false,
        });
      }
    );

    // Fires when the user taps on a notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        // Mark as read
        markNotificationRead(response.notification.request.identifier);

        // Navigate to scholarship detail if a scholarshipId is present
        if (data?.scholarshipId) {
          router.push(`/scholarship/${data.scholarshipId}`);
        } else if (data?.entity_id) {
          router.push(`/scholarship/${data.entity_id}`);
        }
      }
    );

    // Check if app was opened from a killed state via notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        if (data?.scholarshipId) {
          router.push(`/scholarship/${data.scholarshipId}`);
        } else if (data?.entity_id) {
          router.push(`/scholarship/${data.entity_id}`);
        }
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  },
};
