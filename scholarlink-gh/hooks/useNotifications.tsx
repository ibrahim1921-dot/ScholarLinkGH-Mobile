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
        const pushToken = await notificationService.registerForPushNotifications();
        if (pushToken) {
          setToken(pushToken);
          await notificationService.savePushTokenToBackend(pushToken);
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
