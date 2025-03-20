import ProfilingResident from "@/pages/record/profiling/resident/ProfilingResident";
import ResidentProfileForm from "@/pages/record/profiling/resident/ResidentProfileForm";
import ProfilingRequest from "@/pages/record/profiling/resident/ProfilingRequests";
import ProfileViewInfo from "@/pages/record/profiling/resident/ProfilingViewInfo";
import ProfilingHousehold from "@/pages/record/profiling/household/ProfilingHousehold";
import ProfilingBusiness from "@/pages/record/profiling/business/ProfilingBusiness";
import ProfilingFamily from "@/pages/record/profiling/family/ProfilingFamily";
import FamilyProfileForm from "@/pages/record/profiling/family/FamilyProfileForm";

export const profiling_router = [

    // Resident
    {
        path: "resident-records",
        element: <ProfilingResident />
    },
    {
        path: "resident-registration",
        element: <ResidentProfileForm />
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
];