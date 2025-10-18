import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';

// ✅ Modular Firebase imports
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  onTokenRefresh,
  setBackgroundMessageHandler,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

// ✅ Configure how notifications behave when app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const app = getApp();
const messaging = getMessaging(app);

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  console.log('📩 Background FCM message received:', remoteMessage);
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('❌ Failed to show background notification:', error);
  }
});

export function useFCMToken() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const setup = async () => {
      try {
        // 1️⃣ Request notification permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Please enable push notifications.');
          return;
        }

        // 2️⃣ Android notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
          });
        }

        // 3️⃣ Firebase FCM permission and token
        const authStatus = await requestPermission(messaging);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('❌ FCM permission denied');
          return;
        }

        const fcmToken = await getToken(messaging);
        console.log('📲 Firebase FCM Token:', fcmToken);

        const deviceId = Device.modelName || 'unknown-device';

        // 4️⃣ Register FCM token with backend
        try {
          console.log('📤 Sending token to backend...');
          const res = await api.post('notification/register-token/', {
            fcm_token: fcmToken,
            fcm_device_id: deviceId,
          });
          console.log('✅ FCM token registered:', res.data);
        } catch (err: any) {
          console.error('❌ Backend registration failed:', err.response?.data || err.message);
        }

        // 5️⃣ Foreground FCM messages
        const unsubscribeMessage = onMessage(messaging, async (remoteMessage) => {
          console.log('📩 Foreground FCM message received:', remoteMessage);
          
          try {
            // Show notification
            await Notifications.scheduleNotificationAsync({
              content: {
                title: remoteMessage.notification?.title || 'New Notification',
                body: remoteMessage.notification?.body || '',
                data: remoteMessage.data || {},
                sound: true,
              },
              trigger: null,
            });

            // ✨ Invalidate notifications query to refresh the list
            console.log('🔄 Invalidating notifications query...');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            
          } catch (error) {
            console.error('❌ Failed to display notification:', error);
          }
        });

        // 6️⃣ Notification received (foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
          console.log('📩 Notification received (foreground):', n);
          
          // ✨ Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        // 7️⃣ Notification pressed
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          console.log('👆 Notification pressed:', data);

          // ✨ Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ['notifications'] });

          if (data?.screen) {
            try {
              let parsedParams = {};
              if (data.params) {
                parsedParams = typeof data.params === 'string' ? JSON.parse(data.params) : data.params;
              }
              
              const queryString = Object.entries(parsedParams)
                .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
                .join('&');
              
              const href = queryString ? `${data.screen}?${queryString}` : data.screen;
              
              router.push(href as any);
            } catch (error) {
              console.error('❌ Navigation error:', error);
              router.push('/(notification)');
            }
          } else if (data?.redirect_url) {
            router.push(data.redirect_url as any);
          } else {
            router.push('/(notification)');
          }
        });

        // 8️⃣ Handle notification when app opened from quit
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          const data = lastResponse.notification.request.content.data;
          console.log('🚀 App opened via notification:', data);
          
          // ✨ Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          if (data?.screen) {
            try {
              let parsedParams = {};
              if (data.params) {
                parsedParams = typeof data.params === 'string' ? JSON.parse(data.params) : data.params;
              }
              
              const queryString = Object.entries(parsedParams)
                .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
                .join('&');
              
              const href = queryString ? `${data.screen}?${queryString}` : data.screen;
              
              router.push(href as any);
            } catch (error) {
              console.error('❌ Navigation error:', error);
              router.push('/(notification)');
            }
          } else if (data?.redirect_url) {
            router.push(data.redirect_url as any);
          }
        }

        // 9️⃣ Token refresh
        const unsubscribeTokenRefresh = onTokenRefresh(messaging, async (newToken) => {
          console.log('🔄 FCM Token refreshed:', newToken);
          const deviceId = Device.modelName || 'unknown-device';
          try {
            await api.post('notification/register-token/', {
              fcm_token: newToken,
              fcm_device_id: deviceId,
            });
            console.log('✅ Token refreshed successfully');
          } catch (err) {
            console.error('❌ Failed to register refreshed token:', err);
          }
        });

        // 🧹 Cleanup
        return () => {
          unsubscribeMessage();
          unsubscribeTokenRefresh();
          if (notificationListener.current) notificationListener.current.remove();
          if (responseListener.current) responseListener.current.remove();
        };
      } catch (error) {
        console.error('❌ Notification setup failed:', error);
      }
    };

    setup();
  }, [router, queryClient]);
}