
import {createBrowserRouter,RouterProvider} from 'react-router'

import { ord_route } from './routes/ordinancePage-route.tsx'
import { res_route } from './routes/resolutionPage-route.tsx'
import { attendance_route } from './routes/attendacePage-route.tsx';
import { mom_route } from './routes/MinutesOfMeetingPage-route.tsx';
import { calendar_route } from './routes/calendarPage-route.tsx';

const router = createBrowserRouter([
  ...calendar_route,
  ...ord_route,
  ...res_route,
  ...attendance_route,
  ...mom_route
]);

function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </> 
  )
}

export default App;
