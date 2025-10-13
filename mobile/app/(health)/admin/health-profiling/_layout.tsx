import { Stack } from "expo-router"

export default () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }}/>
      <Stack.Screen name="resident-registration" options={{ headerShown: false, animation: 'fade' }}/>
      <Stack.Screen name="household-registration" options={{ headerShown: false, animation: 'fade' }}/>
      <Stack.Screen name="family-profiling" options={{ headerShown: false, animation: 'fade' }}/>
      <Stack.Screen name="family-records" options={{ headerShown: false, animation: 'fade' }}/>
    </Stack>
  )
}
