import CertificatePage from './pages/certifications&permits/Certification';
import BusinessPermitsPage from './pages/certifications&permits/BusinessPermits';
import SummonPermitsPage from './pages/certifications&permits/SummonPermit';
import AddDocumentPage from './pages/documentTemplates/AddDocument';

import {createBrowserRouter,RouterProvider} from 'react-router'

const router = createBrowserRouter([
  {
    path: '/',
    element: <SummonPermitsPage/>,
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