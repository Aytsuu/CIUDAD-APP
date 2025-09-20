import { Stack } from "expo-router"

export default () => {
  return (
    <Stack>
      <Stack.Screen name="settings" options={{ headerShown: false}}/>
      <Stack.Screen name="about" options={{ headerShown: false}}/>
      <Stack.Screen name="support" options={{ headerShown: false}}/>
      <Stack.Screen name="app-rating" options={{ headerShown: false}}/>
    </Stack>
  )
}