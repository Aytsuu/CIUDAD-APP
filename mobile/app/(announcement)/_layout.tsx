import { Stack } from "expo-router"

export default () => {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name='announcementcreate' options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  )
}