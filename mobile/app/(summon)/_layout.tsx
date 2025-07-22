import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return(
        <ToastProvider>
            <Stack>
                <Stack.Screen name="index" options={{headerShown: false}}/>
                {/* <Stack.Screen name="budget-tracker/budget-income-expense-main" options={{ headerShown: false }} /> */}
                
            </Stack>
        </ToastProvider>
    )
}