import DRRMonthlyARReport from "./pages/report/drr/drr-monthly-ar-report"
import DRRWeeklyARReport from "./pages/report/drr/drr-weekly-ar-report"
import { createBrowserRouter, RouterProvider } from 'react-router'
import DRRStaffRecord from "./pages/record/drr/drr-staff-record"
import DRRResidentReport from "./pages/report/drr/drr-resident-report"
import DRRAcknowledgementReport from "./pages/report/drr/drr-acknowledgement-report"
import DRRMapGoogle from "./pages/report/drr/drr-map-google"

const router = createBrowserRouter([
  {
    path: "/monthlyreport", 
    element: <DRRMonthlyARReport/>,
    children: [
      {
        path: ':month',
        element: <DRRWeeklyARReport/>
      }
    ]
  },
  {
    path: '/residentreport',
    element: <DRRResidentReport/>
  },
  {
    path: '/acknowledgementreport',
    element: <DRRAcknowledgementReport/>
  },
  {
    path: "/staff",
    element: <DRRStaffRecord/>,
  },
  {
    path: "/map",
    element: <DRRMapGoogle/>
  }
])

function App() {

  return (
    <RouterProvider router={router}/>
  )
}

export default App
