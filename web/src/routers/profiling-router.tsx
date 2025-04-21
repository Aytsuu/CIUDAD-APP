import ResidentRecords from "@/pages/record/profiling/resident/ResidentRecords";
import ResidentFormLayout from "@/pages/record/profiling/resident/ResidentFormLayout";
import RegistrationRequests from "@/pages/record/profiling/resident/RegistrationRequests";
import HouseholdRecords from "@/pages/record/profiling/household/HouseholdRecords";
import BusinessRecords from "@/pages/record/profiling/business/BusinessRecords";
import FamilyRecords from "@/pages/record/profiling/family/FamilyRecords";
import FamilyProfileForm from "@/pages/record/profiling/family/FamilyProfileForm";
import HouseholdFormLayout from "@/pages/record/profiling/household/HouseholdFormLayout";
import SoloFormLayout from "@/pages/record/profiling/family/living-solo/SoloFormLayout";
import FamilyRecordView from "@/pages/record/profiling/family/FamilyRecordView";
import HouseholdRecordView from "@/pages/record/profiling/household/HouseholdRecordView";
import BusinessFormLayout from "@/pages/record/profiling/business/BusinessFormLayout";
import AccountRegistrationLayout from "@/pages/record/account/AccountRegisterLayout";
import HealthFamilyForm from "@/pages/record/health-family-profiling/family-profling/HealthFamilyForm";

export const profiling_router = [
  // Account
  {
    path: "account/create",
    element: <AccountRegistrationLayout/>
  },

  // Resident
  {
    path: "resident",
    element: <ResidentRecords />,
  },
  {
    path: "resident/form",
    element: <ResidentFormLayout />,
  },
  {
    path: "resident/view",
    element: <ResidentFormLayout />,
  },
  {
    path: "resident/pending",
    element: <RegistrationRequests />,
  },

  // Family
  {
    path: "family",
    element: <FamilyRecords />,
  },
  {
    path: "family/form",
    element: <FamilyProfileForm />,
  },
  {
    path: "family/family-profile-form",
    element: <HealthFamilyForm />,
  },
  {
    path: "family/form/solo",
    element: <SoloFormLayout />,
  },
  {
    path: "family/view",
    element: <FamilyRecordView />,
  },

  // Household
  {
    path: "household",
    element: <HouseholdRecords />,
  },
  {
    path: "household/form",
    element: <HouseholdFormLayout />,
  },
  {
    path: "household/view",
    element: <HouseholdRecordView />,
  },

  // Business
  {
    path: "business",
    element: <BusinessRecords />,
  },
  {
    path: "business/form",
    element: <BusinessFormLayout />,
  },
];
