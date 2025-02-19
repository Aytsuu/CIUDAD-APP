import CalendarPage from './pages/CalendarPage.tsx'
import OrdinancePage from './pages/records/council/ordinance/ordinancePage.tsx'
import ResolutionPage from './pages/records/council/resolution/resolutionPage.tsx'
import AddOrdinancePage from './pages/records/council/ordinance/AddOrdinance.tsx'
import AttendancePage from './pages/records/council/Attendance/AttendancePage.tsx'
import MinutesOfMeetingPage from './pages/records/council/MinutesOfMeeting/MinutesOfMeetingPage.tsx'

import {createBrowserRouter,RouterProvider} from 'react-router'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AttendancePage/>,
  },
]);

function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </> 
  )
}

export default App;
