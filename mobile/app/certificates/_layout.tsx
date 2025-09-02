import { Stack } from "expo-router";

export default function CertificatesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="cert-list"
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="business-list"
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="issued-cert-list"
        options={{ headerShown: false, animation: 'fade' }}
      />
    </Stack>
  );
}
