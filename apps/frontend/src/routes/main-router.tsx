import MainLayout from '@/layout/MainLayout';
import Dashboard from '@/pages/dashboard/Dashboard';

import { RouteObject} from "react-router";
import { Navigate } from 'react-router';

import { administration_router } from './administration-router';
import { profiling_router } from './profiling-router';
import { drr_router } from "./drr-router";
import { blotter_router } from './blotter-router';
import { ord_router } from './ordinancePage-route';
import { res_router } from './resolutionPage-route';
import { attendance_router } from './attendacePage-route';
import { mom_router } from './MinutesOfMeetingPage-route';
import { council_calendar_router } from './calendarPage-route';


import { donation_router } from './donation-router';
import { waste_router } from './waste-router';

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
            ...blotter_router,
            ...ord_router,
            ...res_router,
            ...attendance_router,
            ...mom_router,
            ...council_calendar_router,
            ...donation_router,
            ...waste_router
        ]
    }
]