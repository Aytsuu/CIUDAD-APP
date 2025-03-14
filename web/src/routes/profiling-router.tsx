import ProfilingMain from "@/pages/record/profiling/resident/ProfilingResident";
import { ProfilingForm } from "@/pages/record/profiling/resident/form/ResidentProfileForm";
import ProfilingRequest from "@/pages/record/profiling/resident/ProfilingRequests";
import ProfileViewInfo from "@/pages/record/profiling/resident/ProfilingViewInfo";
import ProfilingHousehold from "@/pages/record/profiling/household/ProfilingHousehold";
import ProfilingBusiness from "@/pages/record/profiling/business/ProfilingBusiness";

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