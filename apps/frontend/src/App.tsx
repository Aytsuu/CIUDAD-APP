import { createBrowserRouter, RouterProvider, Navigate} from 'react-router';
import Home from "./pages/landing/home";
import SignIn from "./pages/landing/sign-in";
import AboutUs from './pages/landing/about-us';
import LandingLayout from './layout/landing-page/landing-layout';
import Services from './pages/landing/services';
import Donation from './pages/landing/donation';
import BarangayCouncil from './pages/landing/barangay-council';
import DownloadApp from './pages/landing/download-app';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingLayout />, // Layout will wrap all the nested routes
    children: [
      {
        path: "/",
        element: <Navigate to="/home" />
      },
      {
        path: "home",
        element: <Home />
      },
      {
        path: "about-us",
        element: <AboutUs />
      },
      {
        path: "services",
        element: <Services />
      },
      {
        path: "donation",
        element: <Donation />
      },
      {
        path: "barangay-council",
        element: <BarangayCouncil />
      },
      {
        path: "download-app",
        element: <DownloadApp />
      },
      {
        path: "sign-in",
        element: <SignIn />
      }
    ]
  }
]);

function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </> 
  )
}

export default App
  