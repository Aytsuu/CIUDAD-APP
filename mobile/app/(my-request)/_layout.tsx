import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <ToastProvider>
            <Stack>
                <Stack.Screen name="garbage-pickup/garbage-pickup-tracker" options={{ headerShown: false, animation: 'fade' }} />
            </Stack>
        </ToastProvider>
    )
    
}