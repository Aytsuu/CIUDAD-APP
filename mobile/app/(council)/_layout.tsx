import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
  return (
    <ToastProvider>
      <Stack>
        <Stack.Screen name="minutes-of-meeting/mom-view" options={{ headerShown: false }} />
        <Stack.Screen name="minutes-of-meeting/mom-create" options={{ headerShown: false }} />        
        <Stack.Screen name="minutes-of-meeting/mom-edit" options={{ headerShown: false }} />            
        
      </Stack>
    </ToastProvider>
  );
};