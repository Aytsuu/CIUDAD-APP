import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
  return (
    <ToastProvider>
      <Stack>
        <Stack.Screen name="council-events/calendar" options={{ headerShown: false }} />
        <Stack.Screen name="council-events/schedule" options={{ headerShown: false }} />
        <Stack.Screen name="council-events/editEvent" options={{ headerShown: false, headerTitle: ""}}/>
        <Stack.Screen name="attendance/main-attendance-page" options={{ headerShown: false }} />
        <Stack.Screen name="attendance/attendance-info" options={{ headerShown: false }} />
      </Stack>
    </ToastProvider>
  );
};