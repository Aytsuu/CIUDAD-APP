import { Stack } from "expo-router";

export default () => {
    return (
        <Stack>
            <Stack.Screen name="maternal/maternal-landing" options={{ headerShown: false }} />
            <Stack.Screen name="medconsultation/med-landing" options={{ headerShown: false }}  />
            <Stack.Screen name="appointments/schedules" options={{ headerShown: false }}  />
            <Stack.Screen name="index" options={{ headerShown: false }}  />
        </Stack>
    );
}