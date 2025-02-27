import { Navigate } from 'react-router';
import Home from "@/pages/landing/home";
import SignIn from "@/pages/landing/sign-in";
import About from '@/pages/landing/about';
import LandingLayout from '@/layout/landing-layout';
import Services from '@/pages/landing/services';
import Donation from '@/pages/landing/donation';
import BarangayCouncil from '@/pages/landing/barangay-council';
import MobileApp from '@/pages/landing/mobile-app';

export const landing_router = [
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