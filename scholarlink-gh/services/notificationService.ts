import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, onMessage, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { profileService } from './profileService';

export const notificationService = {
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
      const token = await getToken(getMessaging(getApp()));
      return token;
    } catch (error) {
      console.error('Error fetching FCM token:', error);
      return null;
    }
  },

  async saveFcmTokenToBackend(token: string): Promise<void> {
    try {
      await profileService.registerFcmToken(token);
    } catch (error) {
      console.error('Failed to save FCM token to backend:', error);
    }
  },

  setupNotificationListeners(): () => void {
    // Handle foreground notifications
    const unsubscribeOnMessage = onMessage(getMessaging(getApp()), async (remoteMessage) => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      
      if (remoteMessage.notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            data: remoteMessage.data,
          },
          trigger: null,
        });
      }
    });

    // Handle background notification tap
    const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(getMessaging(getApp()), (remoteMessage) => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });

    // Handle killed state tap
    getInitialNotification(getMessaging(getApp())).then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage.notification);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  },
};
