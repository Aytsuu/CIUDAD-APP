import { Stack } from "expo-router";

export default () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="verification" options={{ headerShown: false }}  />
            <Stack.Screen name="demographic-data" options={{ headerShown: false }}  />
            <Stack.Screen name="account-details" options={{ headerShown: false }}  />
            <Stack.Screen name="personal-information" options={{ headerShown: false }}  />
            <Stack.Screen name="mother-information" options={{ headerShown: false }}  />
            <Stack.Screen name="father-information" options={{ headerShown: false }}  />
            <Stack.Screen name="dependents" options={{ headerShown: false }}  />
            <Stack.Screen name="add-dependent" options={{ headerShown: false }}  />
            <Stack.Screen name="view-dependent" options={{ headerShown: false }}  />
            <Stack.Screen name="register-completion" options={{ headerShown: false }}  />
        </Stack>
    );
}