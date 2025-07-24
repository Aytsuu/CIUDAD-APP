import { useEffect } from 'react';

export const EnableNotifications = () => {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              console.log('Notification permission granted');
            }
          } catch (error) {
            console.error('Error requesting notification permission:', error);
          }
        }
      }
    };

    requestNotificationPermission();
  }, []);

  return null;
};