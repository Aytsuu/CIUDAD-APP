import { Stack } from "expo-router";

export default () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}}/>
            <Stack.Screen name="garbage-pickup/form" options={{headerShown: false}}/>
            <Stack.Screen name="certification-request/cert-personal" options={{headerShown: false}}/>
            <Stack.Screen name="certification-request/cert-permit" options={{headerShown: false}}/>
            <Stack.Screen name="certification-request/cert-choices" options={{headerShown: false}}/>
            <Stack.Screen name="cert-tracking/index" options={{ headerShown: false }} />
        </Stack>
    )
}