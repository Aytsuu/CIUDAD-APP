import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <Stack>
            <Stack.Screen name="waste-personnel/waste-personnel-truck" options={{ headerShown: false }} />
            <Stack.Screen name="waste-personnel/waste-truck-create" options={{ headerShown: false }} />
            <Stack.Screen name="waste-personnel/waste-truck-edit" options={{ headerShown: false }} />
        </Stack>
    );
}