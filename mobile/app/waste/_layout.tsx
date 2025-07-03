import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <ToastProvider>
            <Stack>
                <Stack.Screen name="waste-personnel/waste-personnel-truck" options={{ headerShown: false }} />
                <Stack.Screen name="waste-personnel/waste-truck-create" options={{ headerShown: false }} />
                <Stack.Screen name="waste-personnel/waste-truck-edit" options={{ headerShown: false }} />

                <Stack.Screen name="waste-collection/waste-col-main" options={{ headerShown: false }} />
                <Stack.Screen name="waste-collection/waste-col-create" options={{ headerShown: false }} />
                <Stack.Screen name="waste-collection/waste-col-edit" options={{ headerShown: false }} />
            </Stack>
        </ToastProvider>
    );
}