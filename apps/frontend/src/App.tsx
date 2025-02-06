import MonthlyARReport from "./pages/report/drr/monthly-ar-report"
import WeeklyARReport from "./pages/report/drr/weekly-ar-report"
import { createBrowserRouter, RouterProvider } from 'react-router'

const router = createBrowserRouter([
  {
    path: "/",
    element: <MonthlyARReport/>
  }

])

function App() {

  return (
    <RouterProvider router={router}/>
  )
}

export default App
