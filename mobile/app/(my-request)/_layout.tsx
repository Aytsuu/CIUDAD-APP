import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <ToastProvider>
            <Stack>
                <Stack.Screen name="garbage-pickup/garbage-pickup-tracker" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="garbage-pickup/garbage-cancel-req-form" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="certification-tracking/certificate-request-tracker" options={{ headerShown: false, animation: 'fade' }} />

            </Stack>
        </ToastProvider>
    )
    
}