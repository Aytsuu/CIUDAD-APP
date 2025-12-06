import { DefaultTheme, ThemeProvider, Theme } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { NAV_THEME } from '@/lib/constants';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import * as NavigationBar from 'expo-navigation-bar';
import { Provider } from "react-redux";
import { store, persistor } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { useFCMToken } from '@/helpers/useFCMToken';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};

function FCMTokenInitializer() {
  useFCMToken();
  return null;
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    'Geist': require('../assets/fonts/Geist.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Set navigation bar
        await NavigationBar.setBackgroundColorAsync('#ffffff');
        await NavigationBar.setButtonStyleAsync('dark');

        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // 3. WAIT FOR BOTH APP AND FONTS TO BE READY
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  // 4. CHECK IF FONTS ARE LOADED
  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style='dark' translucent />
      <ThemeProvider value={LIGHT_THEME}>
        <GestureHandlerRootView className='flex-1'>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <QueryClientProvider client={queryClient}>
                <ToastProvider>
                  <FCMTokenInitializer />
                  <Stack initialRouteName='(auth)'>
                    <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(account)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(announcement)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(business)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(complaint)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(profiling)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(report)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(securado)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(health)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="animal-bites/[id]" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(donation)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(council)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(treasurer)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(waste)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(request)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(gad)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(summon)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(my-request)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(certificates)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(notification)" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="+not-found" options={{ headerShown: false, animation: 'fade' }} />
                  </Stack>
                </ToastProvider>
              </QueryClientProvider>
            </PersistGate>
          </Provider>
          <PortalHost />
        </GestureHandlerRootView>
      </ThemeProvider>
    </View>
  );
}