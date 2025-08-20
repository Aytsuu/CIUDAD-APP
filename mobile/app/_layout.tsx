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
import { AuthProvider } from "@/contexts/AuthContext";
import * as NavigationBar from 'expo-navigation-bar';
import {Provider} from "react-redux"
import {store} from "@/redux/index"

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient({
    
  });

  const [loaded] = useFonts({
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#ffffff');
    NavigationBar.setButtonStyleAsync('dark');
  }, []);

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
      <AuthProvider>
        <Provider store={store}>
        <StatusBar backgroundColor="transparent" style="dark" />
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <Stack >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(business)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(complaint)" options={{ headerShown: false }} />
              <Stack.Screen name="(profiling)" options={{ headerShown: false }} />
              <Stack.Screen name="(report)" options={{ headerShown: false }} />
              <Stack.Screen name="(request)" options={{ headerShown: false }} />
              <Stack.Screen name="(health)" options={{ headerShown: false }} />
              <Stack.Screen name="animal-bites/[id]" options = {{headerShown: false}}/>
              <Stack.Screen name="donation" options = {{headerShown: false}}/>
              <Stack.Screen name="(council)" options={{ headerShown: false }} />
              <Stack.Screen name="(treasurer)" options = {{headerShown: false}}/>
              <Stack.Screen name="(waste)" options = {{headerShown: false}}/>
              <Stack.Screen name="gad" options = {{headerShown: false}}/>
              <Stack.Screen name="(summon)" options = {{headerShown: false}}/>
              <Stack.Screen name="+not-found" />
            </Stack>
          </QueryClientProvider>
        </ToastProvider>
        </Provider>
      </AuthProvider>
      <PortalHost />
    </ThemeProvider>
  );
}