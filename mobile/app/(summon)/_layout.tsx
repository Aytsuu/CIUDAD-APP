import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return(
        <ToastProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }}/>
                <Stack.Screen name="summon-view-details" options={{ headerShown: false, animation: 'fade' }} />
                
            </Stack>
        </ToastProvider>
    )
}