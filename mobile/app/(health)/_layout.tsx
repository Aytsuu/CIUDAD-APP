import { Stack } from "expo-router";

export default () => {
    return (
        <Stack>
            <Stack.Screen name="admin/patientsrecord/patientsrecord" options={{ headerShown: false }} />
            <Stack.Screen name="medconsultation/med-landing" options={{ headerShown: false }} />
            <Stack.Screen name="medconsultation/consultationpage" options={{ headerShown: false }} />
            <Stack.Screen name="medconsultation/setschedule" options={{ headerShown: false}} />
            <Stack.Screen name="maternal/maternal-landing" options={{ headerShown: false }} /> 
            <Stack.Screen name="appointments/schedules" options={{ headerShown: false }} />
            <Stack.Screen name="my-records/all-records" options={{ headerShown: false }} />
            <Stack.Screen name="family-planning/familyplanning" options={{ headerShown: false }} />
            <Stack.Screen name="maternal/bookingpage" options={{ headerShown: false }} />
            <Stack.Screen name="family-planning/famplanning" options={{ headerShown: false }} />
            <Stack.Screen name="medicine-request/request-page" options={{ headerShown: false }} />
            <Stack.Screen name="medicine-request/cart" options={{ headerShown: false }} />
            <Stack.Screen name="medicine-request/med-request" options={{ headerShown: false }} />
            <Stack.Screen name="medicine-request/confirmation" options={{ headerShown: false }} />
            <Stack.Screen name="medicine-request/details" options={{ headerShown: false }} />
            <Stack.Screen name="animalbite/animalbite" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="inventory/medicine" options={{ headerShown: false }} />
            <Stack.Screen name="admin/medicinerequest/medicinerequest" options={{ headerShown: false }} />
            <Stack.Screen name="admin/animalbites/individual" options={{ headerShown: false }} />
            <Stack.Screen name="admin/animalbites/overall" options={{ headerShown: false }} />
            <Stack.Screen name="admin/requestspage" options={{ headerShown: false }} />


            <Stack.Screen name="admin/familyplanning/individual" options={{headerShown:false}} />
            <Stack.Screen name="admin/familyplanning/viewpage1" options={{headerShown:false}} />
            <Stack.Screen name="admin/familyplanning/overall" options={{headerShown:false}} />
        </Stack>
    );
}