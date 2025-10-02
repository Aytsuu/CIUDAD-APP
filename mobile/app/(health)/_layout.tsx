// app/_layout.tsx
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import these
const queryClient = new QueryClient();

export default () => {
    return (
        <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="home" options={{ headerShown: false }} />

                <Stack.Screen name="medconsultation/med-landing" options={{ headerShown: false }} />
                <Stack.Screen name="medconsultation/consultationpage" options={{ headerShown: false }} />
                <Stack.Screen name="medconsultation/setschedule" options={{ headerShown: false}} />

                
                <Stack.Screen name="medicine-request/cart" options={{ headerShown: false }} />
                <Stack.Screen name="medicine-request/med-request" options={{ headerShown: false }} />
                <Stack.Screen name="medicine-request/confirmation" options={{ headerShown: false }} />
                <Stack.Screen name="medicine-request/details" options={{ headerShown: false }} />
                <Stack.Screen name="medicine-request/request-details" options={{headerShown: false}}/>
                <Stack.Screen name="medicine-request/admin-request" options={{headerShown: false}}/>
                <Stack.Screen name="medicine-request/my-requests" options={{headerShown: false}}/>
                
                
                <Stack.Screen name="family-planning/familyplanning" options={{ headerShown: false }} />
                <Stack.Screen name="family-planning/famplanning" options={{ headerShown: false }} />
                <Stack.Screen name="family-planning/fp-dashboard" options={{headerShown:false}}/>
                <Stack.Screen name="family-planning/fp-details" options={{headerShown:false}}/>
                <Stack.Screen name="family-planning/fp-record" options={{headerShown:false}}/>
                
                
                <Stack.Screen name="animalbite/my-records" options={{headerShown: false}}/>
                <Stack.Screen name="animalbite/animalbite" options={{ headerShown: false }} />
                
                
                <Stack.Screen name="maternal/maternal-landing" options={{ headerShown: false }} /> 
                <Stack.Screen name="appointments/schedules" options={{ headerShown: false }} />
                <Stack.Screen name="my-records/all-records" options={{ headerShown: false }} />
                <Stack.Screen name="maternal/bookingpage" options={{ headerShown: false }} />
                <Stack.Screen name="medicine-request/request-page" options={{ headerShown: false }} />


                <Stack.Screen name="admin/animalbites/individual" options={{ headerShown: false }} />
                <Stack.Screen name="admin/animalbites/overall" options={{ headerShown: false }} />


                <Stack.Screen name="admin/patientsrecord/patientrecords" options={{ headerShown: false }} />
                <Stack.Screen name="admin/medicinerequest/medicinerequest" options={{ headerShown: false }} />
                <Stack.Screen name="admin/requestspage" options={{ headerShown: false }} />


                <Stack.Screen name="admin/inventory/medicine" options={{ headerShown: false }} />
                <Stack.Screen name="admin/inventory/transaction" options={{headerShown:false}} />
                <Stack.Screen name="admin/familyplanning/comparison" options={{headerShown:false}} />
                <Stack.Screen name="admin/familyplanning/individual" options={{headerShown:false}} />
                <Stack.Screen name="admin/familyplanning/viewpage1" options={{headerShown:false}} />
                <Stack.Screen name="admin/familyplanning/overall" options={{headerShown:false}} />


                <Stack.Screen name="admin/schedules/all-appointment" options={{headerShown:false}}/>
                
                
                <Stack.Screen name="admin/scheduler/schedule-main" options={{headerShown:false}}/>
                <Stack.Screen name="admin/scheduler/schedule-weekly" options={{headerShown:false}}/>
                <Stack.Screen name="admin/scheduler/schedule-today" options={{headerShown:false}}/>
                <Stack.Screen name="admin/childhealth/individual" options={{headerShown:false}}/>
                <Stack.Screen name="admin/childhealth/overall" options={{headerShown:false}}/>
                <Stack.Screen name="admin/childhealth/history" options={{headerShown:false}}/>
  

                <Stack.Screen name="admin/first-aid/overall" options={{headerShown: false}}/>
                <Stack.Screen name="admin/first-aid/individual" options={{headerShown: false}}/>


                <Stack.Screen name="admin/medicinerecords/overall" options={{headerShown: false}}/>
                <Stack.Screen name="admin/medicinerecords/individual" options={{headerShown: false}}/>
                <Stack.Screen name="admin/vaccination/overall" options={{headerShown: false}}/>
                <Stack.Screen name="admin/vaccination/individual" options={{headerShown: false}}/>


                <Stack.Screen name="admin/maternal/overall" options={{headerShown: false}}/>
                <Stack.Screen name="admin/maternal/individual" options={{headerShown: false}}/>
                <Stack.Screen name="maternal/my-records" options={{headerShown: false}}/>
                <Stack.Screen name="maternal/my-appointments" options={{headerShown: false}}/>


                <Stack.Screen name="vaccination/my-records" options={{ headerShown: false }} />
                <Stack.Screen name="my-schedules/my-schedules" options={{headerShown:false}}/>
                <Stack.Screen name="first-aid/my-records" options={{headerShown: false}}/>

                <Stack.Screen name="medicine-records/my-records" options={{headerShown: false}}/>
            </Stack>
    );
}