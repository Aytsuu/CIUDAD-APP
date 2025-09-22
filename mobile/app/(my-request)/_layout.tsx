import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <ToastProvider>
            <Stack>
                <Stack.Screen name="garbage-pickup/garbage-pickup-tracker" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="garbage-pickup/garbage-cancel-req-form" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="garbage-pickup/view-accepted-details" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="garbage-pickup/view-completed-details" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="certification-tracking/certificate-request-tracker" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="complaint-tracking/compMainReq" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="complaint-tracking/compViewReq" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="complaint-tracking/compMainView" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="complaint-tracking/schedule" options={{ headerShown: false, animation: 'fade' }} />


            </Stack>
        </ToastProvider>
    )
    
}