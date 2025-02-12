import CalendarPage from './pages/CalendarPage.tsx'
import OrdinancePage from './pages/records/council/ordinance/ordinancePage.tsx'
import ResolutionPage from './pages/records/council/resolution/resolutionPage.tsx'
import AddOrdinancePage from './pages/records/council/ordinance/AddOrdinance.tsx'

import {createBrowserRouter,RouterProvider} from 'react-router'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AddOrdinancePage/>,
  },
]);

function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </> 
  )
}

export default App
  