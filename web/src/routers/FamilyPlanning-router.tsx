import FamPlanning_table from "@/pages/record/health/familyplanning/OverallTable"
import FamilyPlanningView from "@/pages/familyplanning/ViewPage1"
import FamilyPlanningMain from "@/pages/familyplanning/main"
import IndividualFamPlanningTable from "@/pages/record/health/familyplanning/Individual"
import FamilyPlanningView2 from "@/pages/familyplanning/ViewPage2"
import FamilyPlanningPage from "@/pages/familyplanning/main"
import FamilyPlanningHistoryPage from "@/pages/familyplanning/FamilyPlanningHistoryPage"
import MultiRecordComparisonPage from "@/pages/familyplanning/ComparisonPage"

export const famplanning_route = [
  {
    path: "/FamPlanning_view2",
    element: <FamilyPlanningView2 />,
  },
  {
    path: "/FamPlanning_view",
    element: <FamilyPlanningView />,
  },
  {
    path: "/FamPlanning_main",
    element: <FamilyPlanningMain />,
  },
  {
    path: "/FamPlanning_table",
    element: <FamPlanning_table />,
  },
  {
    path: "/familyplanning/patient/:patientId",
    element: <IndividualFamPlanningTable />,
  },
  // Route for creating a new Family Planning Record (blank form)
  {
    path: "/familyplanning/new-record",
    element: <FamilyPlanningPage mode="create" />,
  },
  // NEW: Route for creating a new record with patient pre-selected and pre-filled
  {
    path: "/familyplanning/new-record/:patientId",
    element: <FamilyPlanningPage />, // Mode will be determined by query params
  },
  {
    path: "/familyplanning/compare-multiple",
    element: <MultiRecordComparisonPage />,
  },
  {
    path: "/familyplanning/history/:patientId",
    element: <FamilyPlanningHistoryPage />,
  },
  // Route for viewing or editing an existing specific Family Planning Record
  {
    path: "/familyplanning/records/:fprecordId",
    element: <FamilyPlanningPage />,
  },
  {
    path: "/familyplanning/individual/:patientId",
    element: <IndividualFamPlanningTable />,
  },
  {
    path: "/familyplanning/view/:fprecordId",
    element: <FamilyPlanningView />,
  },
  {
    path: "/familyplanning/view2/:fprecordId",
    element: <FamilyPlanningView2 />,
  },
]
