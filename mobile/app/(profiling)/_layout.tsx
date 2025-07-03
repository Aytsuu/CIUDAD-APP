import { Stack } from "expo-router"

export default () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}}/>
      <Stack.Screen name="resident-records" options={{headerShown: false}}/>
      <Stack.Screen name="family-records" options={{headerShown: false}}/>
      <Stack.Screen name="household-records" options={{headerShown: false}}/>
      <Stack.Screen name="business-records" options={{headerShown: false}}/>
    </Stack>
  )
}