import { Stack } from "expo-router";

export default () => {
    return (
        <Stack>
            <Stack.Screen name="maternal/maternal-landing" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="medconsultation/med-landing" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="appointments/schedules" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="my-records/all-records" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="family-planning/familyplanning" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="family-planning/famplanning" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="medicine-request/request-page" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="medicine-request/cart" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="medicine-request/med-request" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="medicine-request/confirmation" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="animalbite/animalbite" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="medicine-request/details" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
        </Stack>
    );
}