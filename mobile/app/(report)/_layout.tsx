import { Stack } from "expo-router"

export default () => {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name='incident/form' options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name='incident/records' options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name='incident/details' options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name='securado/map' options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name='acknowledgement/records' options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name='weekly-ar/records' options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  )
}