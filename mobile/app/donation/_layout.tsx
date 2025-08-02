import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <ToastProvider>
            <Stack>
                <Stack.Screen name="resDonationMain" options={{ headerShown: false }} />
                <Stack.Screen name="staffDonationMain" options={{ headerShown: false }} />
                <Stack.Screen name="staffDonationAdd" options={{ headerShown: false }} />
                <Stack.Screen name="staffDonationView" options={{ headerShown: false }} />  
            </Stack>
        </ToastProvider>
    );
}