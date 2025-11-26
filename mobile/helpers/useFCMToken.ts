import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { getApp } from '@react-native-firebase/app';
import { 
  getMessaging, 
  requestPermission, 
  getToken, 
  onMessage, 
  onTokenRefresh, 
  setBackgroundMessageHandler, 
  AuthorizationStatus
} from '@react-native-firebase/messaging';

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

// Background message handler
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  console.log('📩 Background FCM message received:', remoteMessage);
  
  try {
    // Schedule a notification to be shown immediately
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        data: {
          ...remoteMessage.data,
          // Store navigation data for when user taps notification
          screen: remoteMessage.data?.screen,
          params: remoteMessage.data?.params,
          redirect_url: remoteMessage.data?.redirect_url,
        },
        sound: true,
      },
      trigger: null, // Show immediately
    });
    console.log('✅ Background notification scheduled');
  } catch (error) {
    console.error('❌ Failed to show background notification:', error);
  }
});

// Helper function to handle navigation from notification data
const handleNotificationNavigation = (data: any, router: any) => {
  console.log('🔗 Handling notification navigation with data:', data);
  
  try {
    // Priority 1: Check for 'mobile_route' (mobile-specific routing)
    if (data?.mobile_route) {
      let parsedParams = {};
      
      if (data.mobile_params) {
        parsedParams = typeof data.mobile_params === 'string' 
          ? JSON.parse(data.mobile_params) 
          : data.mobile_params;
      }
      
      const queryString = Object.entries(parsedParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      const href = queryString ? `${data.mobile_route}?${queryString}` : data.mobile_route;
      
      console.log('✅ Navigating to mobile_route:', href);
      router.push(href as any);
      return true;
    }
    
    // Priority 2: Check for 'screen' parameter (legacy format)
    if (data?.screen) {
      let parsedParams = {};
      
      if (data.params) {
        parsedParams = typeof data.params === 'string' 
          ? JSON.parse(data.params) 
          : data.params;
      }
      
      const queryString = Object.entries(parsedParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      const href = queryString ? `${data.screen}?${queryString}` : data.screen;
      
      console.log('✅ Navigating to screen:', href);
      router.push(href as any);
      return true;
    }
    
    console.log('ℹ️ No specific route found, navigating to notifications');
    router.push('/(notification)');
    return false;
    
  } catch (error) {
    console.error('❌ Navigation error:', error);
    router.push('/(notification)');
    return false;
  }
};

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

        // 2️⃣ Set up Android notification channel
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
            // Show notification in foreground
            // await Notifications.scheduleNotificationAsync({
            //   content: {
            //     title: remoteMessage.notification?.title || 'New Notification',
            //     body: remoteMessage.notification?.body || '',
            //     data: {
            //       ...remoteMessage.data,
            //       mobile_route: remoteMessage.data?.mobile_route,
            //       mobile_params: remoteMessage.data?.mobile_params,
            //     },
            //     sound: true,
            //   },
            //   trigger: null,
            // });

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

        // 7️⃣ Notification pressed (works for background AND foreground)
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          console.log('👆 Notification pressed:', data);

          // ✨ Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ['notifications'] });

          // Handle navigation using helper function
          handleNotificationNavigation(data, router);
        });

        // 8️⃣ Handle notification when app opened from QUIT state
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          const data = lastResponse.notification.request.content.data;
          console.log('🚀 App opened via notification (from quit state):', data);
          
          // ✨ Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Handle navigation using helper function
          handleNotificationNavigation(data, router);
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