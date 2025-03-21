import ProfilingResident from "@/pages/record/profiling/resident/ProfilingResident";
import ResidentFormLayout from "@/pages/record/profiling/resident/ResidentFormLayout";
import ProfilingRequest from "@/pages/record/profiling/resident/ProfilingRequests";
import ProfilingHousehold from "@/pages/record/profiling/household/ProfilingHousehold";
import ProfilingBusiness from "@/pages/record/profiling/business/ProfilingBusiness";
import ProfilingFamily from "@/pages/record/profiling/family/ProfilingFamily";
import FamilyProfileForm from "@/pages/record/profiling/family/FamilyProfileForm";
import HouseholdFormLayout from "@/pages/record/profiling/household/HouseholdFormLayout";

export const profiling_router = [

    // Resident
    {
        path: "resident-records",
        element: <ProfilingResident />
    },
    {
        path: "resident-form",
        element: <ResidentFormLayout />
    },
    {
        path: "registration-request",
        element: <ProfilingRequest />
    },
    
    // Family
    {
        path: "family-records",
        element: <ProfilingFamily />
    },
    {
        path: "family-form",
        element: <FamilyProfileForm />
    },


    // Household
    {
        path: "household-records",
        element: <ProfilingHousehold />
    },
    {
        path: "household-form",
        element: <HouseholdFormLayout />
    },

    // Business
    {
        path: "business-records",
        element: <ProfilingBusiness />
    },
];