import ProfilingMain from "@/pages/record/profiling/resident/ProfilingResident";
import { ProfilingForm } from "@/pages/record/profiling/form/ResidentProfileForm";
import ProfilingRequest from "@/pages/record/profiling/resident/ProfilingRequests";
import ProfileViewInfo from "@/pages/record/profiling/resident/ProfilingViewInfo";
import ProfilingHousehold from "@/pages/record/profiling/household/ProfilingHousehold";
import ProfilingBusiness from "@/pages/record/profiling/business/ProfilingBusiness";
import ProfilingFamily from "@/pages/record/profiling/family/ProfilingFamily";

export const profiling_router = [

    // Resident
    {
        path: "resident-records",
        element: <ProfilingMain />
    },
    {
        path: "resident-registration",
        element: <ProfilingForm />
    },
    {
        path: "registration-request",
        element: <ProfilingRequest />
    },
    {
        path: "resident-information",
        element: <ProfileViewInfo />
    },
    
    // Family
    {
        path: "family-records",
        element: <ProfilingFamily />
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
];