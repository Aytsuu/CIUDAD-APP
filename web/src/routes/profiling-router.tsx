<<<<<<< HEAD
import ProfilingMain from "@/pages/record/profiling/ProfilingMain";
import { ProfilingForm } from "@/pages/record/profiling/FormPage/ProfilingForm";
import ProfilingRequest from "@/pages/record/profiling/ProfilingRequests";
import ProfileViewInfo from "@/pages/record/profiling/ProfilingViewInfo";

export const profiling_router = [
=======
import ProfilingMain from "@/pages/record/profiling/resident/ProfilingResident";
import ResidentProfileForm from "@/pages/record/profiling/resident/ResidentProfileForm";
import ProfilingRequest from "@/pages/record/profiling/resident/ProfilingRequests";
import ProfileViewInfo from "@/pages/record/profiling/resident/ProfilingViewInfo";
import ProfilingHousehold from "@/pages/record/profiling/household/ProfilingHousehold";
import ProfilingBusiness from "@/pages/record/profiling/business/ProfilingBusiness";
import ProfilingFamily from "@/pages/record/profiling/family/ProfilingFamily";
import FamilyProfileForm from "@/pages/record/profiling/family/FamilyProfileForm";

export const profiling_router = [

    // Resident
>>>>>>> master
    {
        path: "resident-records",
        element: <ProfilingMain />
    },
    {
        path: "resident-registration",
<<<<<<< HEAD
        element: <ProfilingForm />
=======
        element: <ResidentProfileForm />
>>>>>>> master
    },
    {
        path: "registration-request",
        element: <ProfilingRequest />
    },
    {
        path: "resident-information",
        element: <ProfileViewInfo />
<<<<<<< HEAD
    }
=======
    },
    
    // Family
    {
        path: "family-records",
        element: <ProfilingFamily />
    },
    {
        path: "family-registration",
        element: <FamilyProfileForm />
    },


    // Household
    {
        path: "household-records",
        element: <ProfilingHousehold />
    },

    // Business
    {
        path: "business-records",
        element: <ProfilingBusiness />
    },
>>>>>>> master
];