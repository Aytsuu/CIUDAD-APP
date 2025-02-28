import MainLayout from '@/layout/MainLayout';
import Dashboard from '@/pages/dashboard/Dashboard';

import { RouteObject} from "react-router";
import { Navigate } from 'react-router';

import { administration_router } from './administration-router';
import { profiling_router } from './profiling-router';
import { drr_router } from "./drr-router";
import { blotter_router } from './blotter-router';

export const main_router: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <Navigate to="/dashboard" />
            },
            {
                path: "dashboard",
                element: <Dashboard/>
            },
            ...administration_router,
            ...profiling_router,
            ...drr_router,
            ...blotter_router
        ]
    }
]