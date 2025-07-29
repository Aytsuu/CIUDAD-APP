import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <ToastProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="budget-tracker/budget-income-expense-main" options={{ headerShown: false }} />
                <Stack.Screen name="budget-tracker/budget-expense-main" options={{ headerShown: false }} />
                <Stack.Screen name="budget-tracker/budget-expense-create" options={{ headerShown: false }} />             
                <Stack.Screen name="budget-tracker/budget-expense-edit" options={{ headerShown: false }} />               
                <Stack.Screen name="budget-tracker/budget-income-main" options={{ headerShown: false }} />               
                <Stack.Screen name="budget-tracker/budget-income-create" options={{ headerShown: false }} />                         
                <Stack.Screen name="budget-tracker/budget-income-edit" options={{ headerShown: false }} />  
                <Stack.Screen name="receipt/receipt-main" options={{ headerShown: false }} />  
                <Stack.Screen name='rates/annual-gross-sales-create' options = {{headerShown: false}} />
                <Stack.Screen name='rates/purpose-and-rate-create' options = {{headerShown: false}} />
                <Stack.Screen name='rates/purpose-and-rate-edit' options = {{headerShown: false}} />
                <Stack.Screen name='rates/annual-gross-sales-edit' options = {{headerShown: false}} />
                <Stack.Screen name="inc-disbursement/inc-disb-main" options={{ headerShown: false }} />
                <Stack.Screen name="inc-disbursement/inc-disb-create" options={{ headerShown: false }} />
                <Stack.Screen name="inc-disbursement/inc-disb-edit" options={{ headerShown: false }} />        
                <Stack.Screen name="budgetPlan/budget-plan-view" options={{ headerShown: false }} />
            </Stack>
        </ToastProvider>
    );
}