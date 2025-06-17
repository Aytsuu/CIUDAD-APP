import ForwardedVaccinationRecords from "@/pages/healthServices/forwardedrecord/ForwTable"
import ForwardedVaccinationForm from "@/pages/healthServices/forwardedrecord//ForwardedVaccination";

export const forwardedhealthrecord_router = [
    { 
        path: '/forwarded-vaccination-records',
        element: <ForwardedVaccinationRecords/>
    },
    { 
        path: '/forwarded-vaccination-form',
        element: <ForwardedVaccinationForm/>
    },
   
]