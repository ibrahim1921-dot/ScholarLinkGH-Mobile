import { useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { notificationService } from '../services/notificationService';

export function useNotifications() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function initializeNotifications() {
      if (user) {
        const fcmToken = await notificationService.registerForPushNotifications();
        if (fcmToken) {
          setToken(fcmToken);
          await notificationService.saveFcmTokenToBackend(fcmToken);
        }

        cleanup = notificationService.setupNotificationListeners();
      }
    }

    initializeNotifications();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [user]);

  return { token };
}
