import { Navigate } from 'react-router';
import LandingLayout from '@/layout/LandingLayout';
import MobileApp from '@/pages/landing/MobileApp';
import { RouteObject } from 'react-router';
import Health from '@/pages/landing/Health';
// import ForgotPassword from '@/pages/landing/ForgotPass';
import About from '@/pages/landing/About';
import Home from '@/pages/landing/Home';
import Announcements from '@/pages/landing/Announcements';
import ForgotPassword from '@/pages/landing/ForgotPass';
import SignIn from '@/pages/landing/signin/signin';
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
        path: "health",
        element: <Health />
      },
      {
        path: "mobile-app",
        element: <MobileApp />
      },
      {
        path: "sign-in",
        element: <SignIn />
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      },
      {
        path: "announcements",
        element: <Announcements />
      }
    ]
  }
];