import { Stack } from "expo-router"

export default () => {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='announcementcreate' options={{ headerShown: false }} />
      <Stack.Screen name='announcementview' options={{ headerShown: false }} />
    </Stack>
  )
}