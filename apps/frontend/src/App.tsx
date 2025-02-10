import DRRMonthlyARReport from "./pages/report/drr/drr-monthly-ar-report"
import DRRWeeklyARReport from "./pages/report/drr/drr-weekly-ar-report"
import { createBrowserRouter, RouterProvider } from 'react-router'
import DRRStaffRecord from "./pages/record/drr/drr-staff-record"
import DRRResidentReport from "./pages/report/drr/drr-resident-report"
import DRRAcknowledgementReport from "./pages/report/drr/drr-acknowledgement-report"
import DRRMapGoogle from "./pages/report/drr/drr-map-google"

// Creating routes
const router = createBrowserRouter([
  {
    path: "/drr-monthly-report", 
    element: <DRRMonthlyARReport/>,
    children: [
      {
        path: ':month',
        element: <DRRWeeklyARReport/>
      }
    ]
  },
  {
    path: '/drr-resident-report',
    element: <DRRResidentReport/>
  },
  {
    path: '/drr-acknowledgement-report',
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
