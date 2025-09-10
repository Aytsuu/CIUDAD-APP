import { Stack } from 'expo-router'

export default function CertificatesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="cert-list" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="business-list" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="issued-cert-list" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  )
} 