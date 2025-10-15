import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return(
        <ToastProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }}/>
                <Stack.Screen name="view-remarks-details" options={{ headerShown: false, animation: 'fade' }} />
                
            </Stack>
        </ToastProvider>
    )
}