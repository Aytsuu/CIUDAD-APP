import { Stack } from "expo-router";

export default () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }}/>
            <Stack.Screen name="garbage-pickup/form" options={{ headerShown: false, animation: 'fade' }}/>
            <Stack.Screen name="certification-request/cert-personal" options={{ headerShown: false, animation: 'fade' }}/>
            <Stack.Screen name="certification-request/cert-choices" options={{ headerShown: false, animation: 'fade' }}/>
            <Stack.Screen name="certification-request/cert-business-request" options={{headerShown: false, animation: 'fade'}}/>
        </Stack>
    )
}