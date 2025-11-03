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
                <Stack.Screen name="certification-tracking/cert-choices-tracking" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="certification-tracking/certTrackingPersonal" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="certification-tracking/certTrackingBusiness" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="complaint-tracking/compMain" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="complaint-tracking/compMainView" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="complaint-tracking/schedule" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="complaint-tracking/hearing-history" options={{ headerShown: false, animation: 'fade' }} />
                {/* <Stack.Screen name="complaint-tracking/case-tracking" options={{ headerShown: false, animation: 'fade' }} /> */}
            </Stack>
        </ToastProvider>
    )
    
}