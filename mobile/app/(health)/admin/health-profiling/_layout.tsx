import { Stack } from "expo-router"

export default () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }}/>
      <Stack.Screen name="resident-registration" options={{ headerShown: false, animation: 'fade' }}/>
    </Stack>
  )
}
