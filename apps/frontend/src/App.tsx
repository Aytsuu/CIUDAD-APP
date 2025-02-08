import DRRMonthlyARReport from "./pages/report/drr/drr-monthly-ar-report"
import DRRWeeklyARReport from "./pages/report/drr/drr-weekly-ar-report"
import { createBrowserRouter, RouterProvider } from 'react-router'
import DRRStaffRecord from "./pages/record/drr/drr-staff-record"

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
    path: "/staff",
    element: <DRRStaffRecord/>,
  }

])

function App() {

  return (
    <RouterProvider router={router}/>
  )
}

export default App
