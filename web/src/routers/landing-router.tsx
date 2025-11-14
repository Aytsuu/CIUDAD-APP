import LandingLayout from '@/layout/LandingLayout';
import { RouteObject } from 'react-router';
import SignIn from '@/pages/landing/signin/signin';
export const landing_router: RouteObject[] = [
  {
    path: "/",
    element: <LandingLayout />, // Layout will wrap all the nested routes
    children: [
      {
        path: "sign-in",
        element: <SignIn />
      },
    ]
  }
];