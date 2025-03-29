import ResidentRecords from "@/pages/record/profiling/resident/ResidentRecords";
import ResidentFormLayout from "@/pages/record/profiling/resident/ResidentFormLayout";
import RegistrationRequests from "@/pages/record/profiling/resident/RegistrationRequests";
import HouseholdRecords from "@/pages/record/profiling/household/HouseholdRecords";
import ProfilingBusiness from "@/pages/record/profiling/business/ProfilingBusiness";
import FamilyRecords from "@/pages/record/profiling/family/FamilyRecords";
import FamilyProfileForm from "@/pages/record/profiling/family/FamilyProfileForm";
import HouseholdFormLayout from "@/pages/record/profiling/household/HouseholdFormLayout";
import SoloFormLayout from "@/pages/record/profiling/family/living-solo/SoloFormLayout";
import FamilyRecordView from "@/pages/record/profiling/family/FamilyRecordView";

export const profiling_router = [

    // Resident
    {
        path: "resident-records",
        element: <ResidentRecords />
    },
    {
        path: "resident-form",
        element: <ResidentFormLayout />
    },
    {
        path: "registration-request",
        element: <RegistrationRequests />
    },
    
    // Family
    {
        path: "family-records",
        element: <FamilyRecords />
    },
    {
        path: "family-form",
        element: <FamilyProfileForm />
    },
    {
        path: "family-solo-form",
        element: <SoloFormLayout />
    },
    {
        path: "family-record-view",
        element: <FamilyRecordView />
    },

    // Household
    {
        path: "household-records",
        element: <HouseholdRecords />
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