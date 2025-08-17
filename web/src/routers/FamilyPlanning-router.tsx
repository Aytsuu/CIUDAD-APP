import FamPlanning_table from "@/pages/record/health/familyplanning/OverallTable"
import FamilyPlanningView from "@/pages/familyplanning/ViewPage1"
import FamilyPlanningMain from "@/pages/familyplanning/main"
import IndividualFamPlanningTable from "@/pages/record/health/familyplanning/Individual"
// import FamilyPlanningView2 from "@/pages/familyplanning/ViewPage2"
import FamilyPlanningPage from "@/pages/familyplanning/main"
import FamilyPlanningHistoryPage from "@/pages/familyplanning/FamilyPlanningHistoryPage"
import MultiRecordComparisonPage from "@/pages/familyplanning/ComparisonPage"
import FamilyPlanningView2 from "@/pages/familyplanning/ViewPage2"
import PrintableFPView from "@/pages/familyplanning/printablePdf"

export const famplanning_route = [
  {
    path: "/FamPlanning_main",
    element: <FamilyPlanningMain />,
  },
  {
    path: "/FamPlanning_table",
    element: <FamPlanning_table />,
  },
  {
  path: "/familyplanning/printable-view",
  element: <PrintableFPView/>
},

  {
    path: "/familyplanning/new-record",
    element: <FamilyPlanningPage/>,
  },
  {
    path: "/familyplanning/new-record/:patientId",
    element: <FamilyPlanningPage />,
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
    path: "/familyplanning/individual",
    element: <IndividualFamPlanningTable/>,
  },
  {
    path: "/familyplanning/view",
    element: <FamilyPlanningView />,
  },
  {
    path: "/familyplanning/view2",
    element: <FamilyPlanningView2 />,
  },
]