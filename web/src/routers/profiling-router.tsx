import ResidentRecords from "@/pages/record/profiling/resident/ResidentRecords";
import ResidentFormLayout from "@/pages/record/profiling/resident/form/ResidentFormLayout";
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
import AddRegOptions from "@/pages/record/profiling/resident/AddRegOptions";
import HealthFamilyForm from "@/pages/record/health-family-profiling/HealthFamilyForm";
import RegistrationLayout from "@/pages/record/profiling/resident/RegistrationLayout";
import RequestFamilyReg from "@/pages/record/profiling/resident/RequestFamilyReg";
import UpdateComparisonView from "@/pages/record/profiling/resident/form/UpdateComparisonView";
import ActiveRecords from "@/pages/record/profiling/business/ActiveRecords";
import PendingRecords from "@/pages/record/profiling/business/PendingRecords";
import RespondentRecords from "@/pages/record/profiling/business/RespondentRecords";
import RespondentDetails from "@/pages/record/profiling/business/RespondentDetails";
import ProfilingAllRecords from "@/pages/record/profiling/ProfilingAllRecords";

export const profiling_router = [
  // All Records
  {
    path: "profiling/all",
    element: <ProfilingAllRecords />
  },

  // Account
  {
    path: "profiling/account/create",
    element: <AccountRegistrationLayout/>
  },

  // Resident
  {
    path: "profiling/resident",
    element: <ResidentRecords />,
  },
  {
    path: "profiling/resident/form",
    element: <ResidentFormLayout />,
  },
  {
    path: "profiling/resident/registration",
    element: <RegistrationLayout />,
  },
  {
    path: "profiling/resident/view",
    element: <ResidentFormLayout />,
  },
  {
    path: "profiling/resident/update/view",
    element: <UpdateComparisonView />,
  },
  {
    path: "profiling/request/pending",
    element: <RegistrationRequests />,
    children: [
      {
        path: "individual",
        element: <RegistrationRequests />,
      },
      {
        path: "family",
        element: <RegistrationRequests />,
      },
    ]
  },
  {
    path: "profiling/request/pending/individual/registration",
    element: <RegistrationLayout />,
  },
  {
    path: "profiling/request/pending/family/registration",
    element: <RequestFamilyReg />,
  },

  // Family
  {
    path: "profiling/family",
    element: <FamilyRecords />,
  },
  {
    path: "profiling/family/form",
    element: <FamilyProfileForm />,
  },
  {
    path: "profiling/family/family-profile-form",
    element: <HealthFamilyForm />,
  },
  {
    path: "profiling/family/form/solo",
    element: <SoloFormLayout />,
  },
  {
    path: "profiling/family/view",
    element: <FamilyRecordView />,
  },

  // Household
  {
    path: "profiling/household",
    element: <HouseholdRecords />,
  },
  {
    path: "profiling/household/form",
    element: <HouseholdFormLayout />,
  },
  {
    path: "profiling/household/view",
    element: <HouseholdRecordView />,
  },

  // Business
  {
    path: "profiling/business/record",
    element: <BusinessRecords />,
    children: [
      {
        path: "active",
        element: <ActiveRecords />,
      },
      {
        path: "pending",
        element: <PendingRecords />,
      },
      {
        path: "respondent",
        element: <RespondentRecords />,
      },
      {
        path: "respondent/details",
        element: <RespondentDetails />,
      },
    ]
  },
  {
    path: "profiling/business/form",
    element: <BusinessFormLayout />,
  },
];
