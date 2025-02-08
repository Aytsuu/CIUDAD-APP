import DRRMonthlyARReport from "./pages/report/drr/drr-monthly-ar-report"
import DRRWeeklyARReport from "./pages/report/drr/drr-weekly-ar-report"
import { createBrowserRouter, RouterProvider } from 'react-router'

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
  }

])

function App() {

  return (
    <RouterProvider router={router}/>
  )
}

export default App
