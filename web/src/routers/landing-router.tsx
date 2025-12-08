import LandingLayout from '@/layout/LandingLayout';
import { RouteObject } from 'react-router';
export const landing_router: RouteObject[] = [
  {
    path: "/",
    element: <LandingLayout />, // Layout will wrap all the nested routes
  }
];