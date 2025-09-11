import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <ToastProvider>
        <Stack>          
            <Stack.Screen name="budget-tracker/budget-tracker-main" options={{ headerShown: false }} />
            <Stack.Screen name="budget-tracker/budget-tracker-record" options={{ headerShown: false }} />
            <Stack.Screen name="budget-tracker/budget-tracker-create-form" options={{ headerShown: false }} />
            <Stack.Screen name="budget-tracker/budget-tracker-edit-form" options={{ headerShown: false }} />
            <Stack.Screen name="budget-tracker/budget-tracker-log" options={{ headerShown: false }} />
            <Stack.Screen name="project-proposal/projprop-main" options={{ headerShown: false }} />
            <Stack.Screen name="project-proposal/projprop-admin" options={{ headerShown: false }} />
            <Stack.Screen name="project-proposal/projprop-view" options={{ headerShown: false }} />
            <Stack.Screen name="project-proposal/projprop-logs" options={{ headerShown: false }} />
        </Stack>
        </ToastProvider>
    );
}