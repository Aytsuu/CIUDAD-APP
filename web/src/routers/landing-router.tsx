import { Navigate } from 'react-router';
import LandingLayout from '@/layout/LandingLayout';
import { RouteObject } from 'react-router';
// import ForgotPassword from '@/pages/landing/ForgotPass';
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
        path: "sign-in",
        element: <SignIn />
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      },
    ]
  }
];