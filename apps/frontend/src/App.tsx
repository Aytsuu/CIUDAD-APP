
import { createBrowserRouter, RouterProvider } from 'react-router'
import { landing_router } from './routes/landing-router';
import { main_router } from './routes/main-router';

const router = createBrowserRouter([
  ...main_router,
  { path: "*", element: ""}
])

function App() {

  return <RouterProvider router={router} />

}
export default App;
// =======
// // import CertificatePage from './pages/certifications&permits/Certification';
// // import BusinessPermitsPage from './pages/certifications&permits/BusinessPermits';
// // import SummonPermitsPage from './pages/certifications&permits/SummonPermit';
// // import AddDocumentPage from './pages/documentTemplates/AddDocument';

// // import {createBrowserRouter,RouterProvider} from 'react-router'

// // const router = createBrowserRouter([
// //   {
// //     path: '/',
// //     element: <SummonPermitsPage/>,
// //   },
// // ]);

// // function App() {

// //   return (
// //     <>
// //       <RouterProvider router={router}/>
// //     </> 
// //   )
// // }

// // export default App;
// import {createBrowserRouter,RouterProvider} from 'react-router'
// import { certification_route } from './routes/ViewCert-route.tsx';
// import { business_route  } from './routes/ViewBusinessPermit-route.tsx';
// import { summon_route } from './routes/ViewSummon-route.tsx';


// const router = createBrowserRouter([
//   ...certification_route,
//   ...business_route,
//   ...summon_route

// ]);

// function App() {

//   return (
//     <>
//       <RouterProvider router={router}/>
//     </> 
//   )
// }

// >>>>>>> frontend/feature/clerk-certificates
// export default App;