import { Stack } from 'expo-router'
import { ToastProvider } from "@/components/ui/toast";

export default function CertificatesLayout() {
  return (
    <ToastProvider>
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          animation: 'fade'
        }} 
      />
      <Stack.Screen 
        name="cert-main" 
        options={{ 
          headerShown: false,
          animation: 'fade' 
        }} 
      />
      <Stack.Screen 
        name="cert-list" 
        options={{ 
          headerShown: false,
          animation: 'fade'
        }} 
      />
      <Stack.Screen 
        name="business-list" 
        options={{ 
          headerShown: false,
          animation: 'fade'
        }} 
      />
      <Stack.Screen 
        name="issued-cert-list" 
        options={{ 
          headerShown: false,
          animation: 'fade' 
        }} 
      />
    </Stack>
    </ToastProvider>
  )
} 