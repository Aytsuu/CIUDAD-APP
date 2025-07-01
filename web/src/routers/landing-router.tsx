import { Navigate } from 'react-router';
import Home from "@/pages/landing/Home";
import SignIn from "@/pages/landing/Signin";
import About from '@/pages/landing/About';
import LandingLayout from '@/layout/LandingLayout';
import Services from '@/pages/landing/Services';
import Donation from '@/pages/landing/Donation';
import BarangayCouncil from '@/pages/landing/BarangayCouncil';
import MobileApp from '@/pages/landing/MobileApp';
import { RouteObject } from 'react-router';
import Health from '@/pages/landing/Health';


export const landing_router: RouteObject[] = [
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
        path: "about",
        element: <About />
      },
      {
        path: "services",
        element: <Services />
      },
      {
        path: "health",
        element: <Health />
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
        path: "mobile-app",
        element: <MobileApp />
      },
      {
        path: "sign-in",
        element: <SignIn />
      }
    ]
  }
];