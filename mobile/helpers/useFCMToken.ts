import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import { useRouter } from 'expo-router';
import api from '@/api/api';
import * as Device from 'expo-device';

// IMPORTANT: Set up background handler OUTSIDE of any component/hook
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📩 Background message received:', remoteMessage);
  
  try {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'New Notification',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
      android: {
        channelId: 'default',
        smallIcon: 'ic_launcher',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
    });
  } catch (error) {
    console.error('❌ Failed to display background notification:', error);
  }
});

export function useFCMToken() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const setupNotifications = async () => {
      try {
        console.log('🚀 Starting notification setup...');

        // 1. Create notification channel FIRST (Android)
        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: 'default',
            name: 'Default Notifications',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibration: true,
          });
          console.log('✅ Notification channel created');
        }

        // 2. Request permission
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('❌ Notification permission denied');
          Alert.alert('Notification Permission', 'You disabled push notifications.');
          return;
        }

        console.log('✅ Notification permission granted');

        // 3. Get FCM token
        const token = await messaging().getToken();
        console.log('📲 FCM Token obtained:', token.substring(0, 30) + '...');

        // 4. Get device ID (unique identifier)
        const deviceId = Device.modelName || 'unknown-device';
        console.log('📱 Device ID:', deviceId);

        try {
          console.log('📤 Registering token with backend...');
          
          const response = await api.post('notification/register-token/', { 
            fcm_token: token,
            fcm_device_id: deviceId  // ✅ NOW INCLUDED
          });
          
          console.log('✅ FCM token registered successfully:', response.data);
        } catch (err: any) {
          console.error('❌ Failed to register FCM token:', err);
          console.error('❌ Error response:', err.response?.data);
          
          // Show error to user for debugging
          if (__DEV__) {
            Alert.alert(
              'Token Registration Failed',
              `Error: ${err.response?.data?.detail || err.message}`,
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        console.error('❌ Setup failed:', error);
      }
    };

    setupNotifications();

    // Handle foreground messages
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('📩 Foreground message received:', remoteMessage);
      
      try {
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data,
          android: {
            channelId: 'default',
            smallIcon: 'ic_launcher',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
          },
          ios: {
            sound: 'default',
          },
        });
      } catch (error) {
        console.error('❌ Failed to display foreground notification:', error);
      }
    });

    // Handle notification press events (when app is open)
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      console.log('👆 Notification event:', type);
      
      if (type === EventType.PRESS && detail.notification?.data) {
        const data = detail.notification.data as any;
        
        if (data.redirect_url) {
          console.log('🚀 Navigating to:', data.redirect_url);
          router.push(data.redirect_url);
        } else {
          router.push('/(notification)');
        }
      }
    });

    // Handle notification press when app is in background/quit state
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('👆 Background notification event:', type);
      
      if (type === EventType.PRESS && detail.notification?.data) {
        const data = detail.notification.data as any;
        
        if (data.redirect_url) {
          console.log('🚀 Background navigation to:', data.redirect_url);
          // Navigation will happen when app opens
        }
      }
    });

    // Listen for initial notification (when app is opened from quit state)
    notifee.getInitialNotification().then((notification) => {
      if (notification?.notification?.data) {
        const data = notification.notification.data as any;
        
        if (data.redirect_url) {
          console.log('🚀 Initial navigation to:', data.redirect_url);
          router.push(data.redirect_url);
        }
      }
    });

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log('🔄 FCM Token refreshed:', newToken.substring(0, 30) + '...');
      
      try {
        // const deviceId = Device.modelId || Device.osInternalBuildId || 'unknown-device';
        
        await api.post('notification/register-token/', { 
          fcm_token: newToken,
          // fcm_device_id: deviceId
        });
        
        console.log('✅ New FCM token registered successfully');
      } catch (err) {
        console.error('❌ Failed to register refreshed FCM token:', err);
      }
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeForeground();
      unsubscribeNotifee();
      unsubscribeTokenRefresh();
    };
  }, [router]);
}