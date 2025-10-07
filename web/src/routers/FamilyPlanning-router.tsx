import FamPlanning_table from "@/pages/record/health/familyplanning/OverallTable"
// import FamilyPlanningView from "@/pages/familyplanning/ViewPage1"
import FamilyPlanningMain from "@/pages/familyplanning/main"
import IndividualFamPlanningTable from "@/pages/record/health/familyplanning/Individual"
// import FamilyPlanningView2 from "@/pages/familyplanning/ViewPage2"
import FamilyPlanningPage from "@/pages/familyplanning/main"
import FamilyPlanningHistoryPage from "@/pages/familyplanning/FamilyPlanningHistoryPage"
import MultiRecordComparisonPage from "@/pages/familyplanning/ComparisonPage"
import FamilyPlanningView2 from "@/pages/familyplanning/ViewPage2"
import ReportPage from "@/pages/healthServices/reports/famplanning-report/monthly-reports"
import { FamilyPlanningView } from "@/pages/familyplanning/ViewPage1"


export const famplanning_route = [
  {
    path: "services/FamPlanning_main",
    element: <FamilyPlanningMain />,
  },
  {
    path: "/familyplanning/monthlyreport",
    element: <ReportPage/>
  },
  // {
  //   path: "/familyplanning/report",
  //   element: <MonthlyFamilyPlanningReports/>
  // },
  {
    path: "services/familyplanning",
    element: <FamPlanning_table />,
  },
 
  {
    path: "services/familyplanning/new-record",
    element: <FamilyPlanningPage/>,
  },
  {
    path: "services/familyplanning/new-record/:patientId",
    element: <FamilyPlanningPage />,
  },
  {
    path: "services/familyplanning/compare-multiple",
    element: <MultiRecordComparisonPage />,
  },
  {
    path: "services/familyplanning/history/:patientId",
    element: <FamilyPlanningHistoryPage />,
  },
  // Route for viewing or editing an existing specific Family Planning Record
  {
    path: "services/familyplanning/records/:fprecordId",
    element: <FamilyPlanningPage />,
  },
  {
    path: "services/familyplanning/records",
    element: <IndividualFamPlanningTable/>,
  },
  {
    path: "services/familyplanning/view",
    element: <FamilyPlanningView />,
  },
  {
    path: "services/familyplanning/view2",
    element: <FamilyPlanningView2 />,
  },
]

