import { DarkTheme, DefaultTheme, ThemeProvider, Theme} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { NAV_THEME } from '@/lib/constants';
import { PortalHost } from '@rn-primitives/portal';
import 'global.css'


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
<<<<<<< HEAD
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={LIGHT_THEME}>
        <StatusBar backgroundColor="#FFF" style="dark" />
        <Stack initialRouteName='(auth)'>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
=======
    <ThemeProvider value={LIGHT_THEME}>
      <StatusBar backgroundColor="#ECF8FF" style="dark" />


      <Stack initialRouteName='(auth)'>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(health)" options={{ headerShown: false }} />
        <Stack.Screen name="animal-bites/[id]" options = {{headerShown: false}}/>
        <Stack.Screen name="+not-found" />
      </Stack>

      <PortalHost />
    </ThemeProvider>
>>>>>>> master
  );
}