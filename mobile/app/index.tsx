import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

// Background message handler - MUST be at top level
if (Platform.OS !== 'web') {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📩 Background FCM message received:', remoteMessage);
    
    try {
      // Ensure the channel exists
      await notifee.createChannel({
        id: 'default',
        name: 'Default Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });

      // Display notification
      await notifee.displayNotification({
        id: remoteMessage.messageId,
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          sound: 'default',
        },
        ios: {
          sound: 'default',
        },
      });

      console.log('✅ Background notification displayed successfully');
    } catch (error) {
      console.error('❌ Error displaying background notification:', error);
    }
  });

  // Handle background notification press events
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('👆 Background notification event:', type, detail);
    // Navigation will be handled when app opens via useFCMToken hook
  });
}

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect based on auth state
  if (!user) {
    return <Redirect href="/(auth)" />;
  }
  
  return <Redirect href="/(tabs)" />;
}