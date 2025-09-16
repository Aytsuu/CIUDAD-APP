import { Navigate } from 'react-router';
import SignIn from "@/pages/landing/signin/signin";
import LandingLayout from '@/layout/LandingLayout';
import BarangayCouncil from '@/pages/landing/BarangayCouncil';
import MobileApp from '@/pages/landing/MobileApp';
import { RouteObject } from 'react-router';
import Health from '@/pages/landing/Health';
// import ForgotPassword from '@/pages/landing/ForgotPass';
import Services from '@/pages/landing/services';
import About from '@/pages/landing/about';
import Home from '@/pages/landing/home';
import Donation from '@/pages/landing/donation';
// import AuthLayout from '@/layout/AuthLayout';


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
      },
    ]
  },
];