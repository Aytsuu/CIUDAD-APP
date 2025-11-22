import { Stack } from "expo-router";
import { ToastProvider } from "@/components/ui/toast";

export default () => {
    return (
        <ToastProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="waste-personnel/waste-personnel-truck" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="waste-personnel/waste-truck-create" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="waste-personnel/waste-truck-edit" options={{ headerShown: false, animation: 'fade' }} />

                <Stack.Screen name="illegal-dumping/resident/illegal-dump-res-main" options={{ headerShown: false, animation: 'fade' }} />  
                <Stack.Screen name="illegal-dumping/resident/illegal-dump-res-create" options={{ headerShown: false, animation: 'fade' }} />   
                <Stack.Screen name="illegal-dumping/resident/illegal-dump-res-resubmit" options={{ headerShown: false, animation: 'fade' }} />                  
                <Stack.Screen name="illegal-dumping/resident/illegal-dump-view-res" options={{ headerShown: false, animation: 'fade' }} />                                   

                <Stack.Screen name="illegal-dumping/staff/illegal-dump-main-staff" options={{ headerShown: false, animation: 'fade' }} />    
                <Stack.Screen name="illegal-dumping/staff/illegal-dump-view-staff" options={{ headerShown: false, animation: 'fade' }} />  
                
                <Stack.Screen name="waste-collection/waste-col-main" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="waste-collection/waste-col-create" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="waste-collection/waste-col-edit" options={{ headerShown: false, animation: 'fade' }} />     

                <Stack.Screen name="garbage-pickup/staff/main-request" options={{ headerShown: false, animation: 'fade' }} />     
                <Stack.Screen name="garbage-pickup/staff/reject-request" options={{ headerShown: false, animation: 'fade' }} />  
                <Stack.Screen name="garbage-pickup/staff/accept-request" options={{ headerShown: false, animation: 'fade' }} /> 
                <Stack.Screen name="garbage-pickup/staff/edit-assignment" options={{ headerShown: false, animation: 'fade' }} /> 
                <Stack.Screen name="garbage-pickup/staff/view-completed-details" options={{ headerShown: false, animation: 'fade' }} /> 
                <Stack.Screen name="garbage-pickup/staff/view-accepted-details" options={{ headerShown: false, animation: 'fade' }} /> 
                <Stack.Screen name="garbage-pickup/staff/view-pending-details" options={{ headerShown: false, animation: 'fade' }} /> 
                <Stack.Screen name="garbage-pickup/staff/view-rejected-details" options={{ headerShown: false, animation: 'fade' }} /> 
                <Stack.Screen name="garbage-pickup/resident/garbage-pickup-create" options={{ headerShown: false, animation: 'fade' }} /> 
                
                <Stack.Screen name="waste-hotspot/waste-hotspot-create" options={{ headerShown: false, animation: 'fade' }} /> 
                <Stack.Screen name="waste-hotspot/waste-hotspot-edit" options={{ headerShown: false, animation: 'fade' }} />        

                <Stack.Screen name="waste-event/waste-event-main" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="waste-event/waste-event-create" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="waste-event/waste-event-edit" options={{ headerShown: false, animation: 'fade' }} />

            </Stack>
        </ToastProvider>
    );
}