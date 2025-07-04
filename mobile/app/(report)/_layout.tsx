import { Stack } from "expo-router"

export default () => {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='incident/ir-form' options={{ headerShown: false }} />
      <Stack.Screen name='incident/ir-records' options={{ headerShown: false }} />
      <Stack.Screen name='acknowledgement/ar-records' options={{ headerShown: false }} />
    </Stack>
  )
}