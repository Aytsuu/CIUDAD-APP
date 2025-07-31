import { Stack } from "expo-router"

export default () => {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='incident/form' options={{ headerShown: false }} />
      <Stack.Screen name='incident/records' options={{ headerShown: false }} />
      <Stack.Screen name='acknowledgement/records' options={{ headerShown: false }} />
      <Stack.Screen name='weekly-ar/records' options={{ headerShown: false }} />
    </Stack>
  )
}