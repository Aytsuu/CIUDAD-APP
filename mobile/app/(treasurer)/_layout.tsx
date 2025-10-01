import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <ToastProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="budget-tracker/budget-income-expense-main" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="budget-tracker/budget-expense-main" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="budget-tracker/budget-expense-create" options={{ headerShown: false, animation: 'fade' }} />             
                <Stack.Screen name="budget-tracker/budget-expense-edit" options={{ headerShown: false, animation: 'fade' }} />               
                <Stack.Screen name="budget-tracker/budget-income-main" options={{ headerShown: false, animation: 'fade' }} />               
                <Stack.Screen name="budget-tracker/budget-income-create" options={{ headerShown: false, animation: 'fade' }} />                         
                <Stack.Screen name="budget-tracker/budget-income-edit" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="budget-tracker/budget-expense-log" options={{ headerShown: false }} />    
                
                <Stack.Screen name="receipt/receipt-main" options={{ headerShown: false, animation: 'fade' }} />  
                
                <Stack.Screen name='rates/annual-gross-sales-create' options = {{headerShown: false}} />
                <Stack.Screen name='rates/purpose-and-rate-create' options = {{headerShown: false}} />
                <Stack.Screen name='rates/purpose-and-rate-edit' options = {{headerShown: false}} />
                <Stack.Screen name='rates/annual-gross-sales-edit' options = {{headerShown: false}} />
                <Stack.Screen name="disbursementVoucher/disb-main" options={{ headerShown: false, animation: 'fade' }} />
                      
                <Stack.Screen name="budgetPlan/budget-plan-view" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="budgetPlan/budget-plan-suppdoc-create" options={{ headerShown: false, animation: 'fade' }} />

                <Stack.Screen name="clearance-request/clearance-request" options={{ headerShown: false, animation: 'fade' }} />
            </Stack>
        </ToastProvider>
    );
} 