import MainLayout from "@/layout/MainLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import AnnouncementDashboard from "@/pages/announcement/AnnouncementList";
import { medicineRequest } from "./medicine-request";
import { forwardedhealthrecord_router } from "./forwardedhealthrecords";
import { firstaid_router } from "./firstaid-router";
import { health_schedule_routes } from "./health-schedules-router";
import { withTransition } from '@/helpers/withTransition';
import { viewprofile_router } from "./Account-settings";
import { RouteObject } from 'react-router';
import { Navigate } from 'react-router';
import { administration_router } from './administration-router';
import { profiling_router } from './profiling-router';
import { report_router } from './report-router';
import { complaint_router } from './complaint-router';
import { ord_router } from './ordinancePage-router';
import { res_router } from './resolutionPage-router';
import { attendance_router } from './attendacePage-router';
import { mom_router } from './MinutesOfMeetingPage-router';
import { template_router } from './template-router';
import { council_calendar_router } from './calendarPage-route';
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
import { doctorRouting } from './doctor-router';
import { familyProfilingRoute } from './family-profiling-route';
import { patientsRecordRouter } from './patients-record-router';
import { summon_router } from './summon-router';
import { clearances_router } from './clearances-router';
import { team_router } from "./team-router";
import { activity_log_router } from './activity-log-router';
import { ProtectedRoute } from "@/ProtectedRoutes";
import { healthreports_router } from "./health-reports-router";
import { medicalConsultation } from "./med-consultation";
import { NotificationRouter } from "./notification-router";
import { bhw_daily_notes_router } from "./bhw-daily-notes-router";

// Initializing routes with protection
export const main_router: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: withTransition([
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Navigate to="/dashboard" />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "announcement",
        element: (
          <ProtectedRoute exclude={["DOCTOR"]}>
            <AnnouncementDashboard />
          </ProtectedRoute>
        ),
      },
      ...administration_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute adminOnly>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...profiling_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["PROFILING"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...report_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["REPORT"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...complaint_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["COMPLAINT"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...team_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["REPORT"]} exclude={["ADMIN"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...ord_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["COUNCIL"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...res_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["COUNCIL"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...attendance_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["COUNCIL"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...mom_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["COUNCIL"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      // Wrapped this one (it was raw in your snippet)
      ...council_calendar_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...donation_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["DONATION"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...treasurer_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["FINANCE"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...waste_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["WASTE"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      ...activity_log_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      // Keep your special logic for clearances
      ...clearances_router.map((route) => ({
        ...route,
        children: route.children?.map((childRoute) => ({
          ...childRoute,
          element: (
            <ProtectedRoute requiredFeatures={["CERTIFICATION & CLEARANCES"]}>
              {childRoute.element}
            </ProtectedRoute>
          ),
        })),
      })),
      ...maternal_router.map((route) => ({
        ...route,
        element: (
          <ProtectedRoute requiredFeatures={["SERVICES"]}>
            {route.element}
          </ProtectedRoute>
        ),
      })),
      // --- START OF NEWLY PROTECTED ROUTES ---
      ...vaccination.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["SERVICES"]}>{route.element}</ProtectedRoute>,
      })),
      ...childHealthServices.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["SERVICES"]}>{route.element}</ProtectedRoute>,
      })),
      ...gad_router.map((route) => ({
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      })),
      ...bites_route.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["SERVICES"]}>{route.element}</ProtectedRoute>,
      })),
      ...announcement_route.map((route) => ({
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      })),
      ...famplanning_route.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["SERVICES"]}>{route.element}</ProtectedRoute>,
      })),
      ...healthinventory.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["INVENTORY"]}>{route.element}</ProtectedRoute>,
      })),
      ...doctorRouting.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["REFERRED PATIENTS"]}>{route.element}</ProtectedRoute>,
      })),
      ...summon_router.map((route) => ({
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      })),
      ...familyProfilingRoute.map((route) => ({
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      })),
      ...patientsRecordRouter.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["PATIENT RECORDS"]}>{route.element}</ProtectedRoute>,
      })),
      ...medicineRequest.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["SERVICES"]}>{route.element}</ProtectedRoute>,
      })),
      ...forwardedhealthrecord_router.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["FORWARDED RECORDS"]}>{route.element}</ProtectedRoute>,
      })),
      ...firstaid_router.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["SERVICES"]}>{route.element}</ProtectedRoute>,
      })),
      ...health_schedule_routes.map((route) => ({
        ...route,
        element: <ProtectedRoute >{route.element}</ProtectedRoute>,
      })),
      ...viewprofile_router.map((route) => ({
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      })),
      ...template_router.map((route) => ({
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      })),
      ...healthreports_router.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["REPORTS"]}>{route.element}</ProtectedRoute>,
      })),
      ...medicalConsultation.map((route) => ({
        ...route,
        element: <ProtectedRoute requiredFeatures={["SERVICES"]}>{route.element}</ProtectedRoute>,
      })),
      ...bhw_daily_notes_router.map((route) => ({
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      })),
      ...NotificationRouter.map((route) => ({
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      })),
    ]),
  },
];