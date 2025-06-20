import { DarkTheme, DefaultTheme, ThemeProvider, Theme} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { NAV_THEME } from '@/lib/constants';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();

  const [loaded] = useFonts({
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={LIGHT_THEME}>
      <StatusBar backgroundColor="white" style="dark" />
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Stack initialRouteName='(complaint)'>
            <Stack.Screen name="(complaint)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(health)" options={{ headerShown: false }} />
            <Stack.Screen name="animal-bites/[id]" options = {{headerShown: false}}/>
            <Stack.Screen name="+not-found" />
          </Stack>
        </QueryClientProvider>
      </ToastProvider>
      <PortalHost />
    </ThemeProvider>
  );
}