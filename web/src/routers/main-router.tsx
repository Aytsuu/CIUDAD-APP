import MainLayout from '@/layout/MainLayout';
import Dashboard from '@/pages/dashboard/Dashboard';
import AnnouncementDashboard from '@/pages/announcement/AnnouncementList';

import { RouteObject } from 'react-router';
import { Navigate } from 'react-router';
import { administration_router } from './administration-router';
import { profiling_router } from './profiling-router';
import { drr_router } from "./drr-router";
import { blotter_router } from './blotter-router';
import { ord_router } from './ordinancePage-router';
import { res_router } from './resolutionPage-router';
import { attendance_router } from './attendacePage-router';
import { mom_router } from './MinutesOfMeetingPage-router';
import { council_calendar_router } from './calendarPage-route';
import { patientQueue } from './patientsQueue';
import { healthinventory } from './inventory';
import { donation_router } from './donation-router';
import { waste_router } from './waste-router';
import { treasurer_router } from './treasurer-router';
import { maternal_router } from './maternal-services';
import { vaccination } from './vaccination';
import { childHealthServices } from './childHealthServices';
import { gad_router } from './gad-router';
import { bites_route } from './AnimalBite-router';
import { announcement_route } from './Announcement-router';
import { famplanning_route } from './FamilyPlanning-router';
import { medicalConsultation } from './medConsultation';
import { doctorRouting } from './doctor-router';
import { reports_router } from './reports-router';


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
            {
                path: "announcement",
                element: <AnnouncementDashboard/>
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
            ...treasurer_router,
            ...waste_router,
            ...maternal_router,
            ...vaccination,
            ...childHealthServices,
            ...gad_router,
            ...bites_route,
            ...reports_router,
            ...announcement_route,
            ...famplanning_route,
            ...healthinventory,
            ...medicalConsultation,
            ...patientQueue,
            ...doctorRouting
        ]
    }
]