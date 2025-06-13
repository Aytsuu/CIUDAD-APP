import WeeklyARReport from '@/pages/record/report/acknowledgement/WeeklyARReport';
import IRRecords from '@/pages/record/report/incident/IRRecords';
import IRFormLayout from '@/pages/record/report/incident/IRFormLayout';
import ARRecords from '@/pages/record/report/acknowledgement/ARRecords';
import ARFormLayout from '@/pages/record/report/acknowledgement/ARFormLayout';
import ActivityReportRecords from '@/pages/record/report/activity/ActivityReportRecords';
import ReportLayout from '@/pages/record/report/ReportLayout';
import { Navigate } from 'react-router';
import ReportDocument from '@/pages/record/report/ReportDocument';

// Creating routes
export const report_router = [
  {
    path: '/report',
    element: <ReportLayout/>,
    children: [
      {
        path: '/report',
        element: <Navigate to='incident' />
      },
      {
        path: '/report/incident',
        element: <IRRecords/>
      },
      {
        path: '/report/activity',
        element: <ActivityReportRecords/>
      },
      {
        path: '/report/acknowledgement',
        element: <ARRecords/>
      },
      {
        path: '/report/weekly',
        element: <WeeklyARReport/>
      }
    ]
  },
  {
    path: '/report/incident/form',
    element: <IRFormLayout/>
  },
  {
    path: '/report/acknowledgement/form',
    element: <ARFormLayout/>
  },
  {
    path: '/report/acknowledgement/document/',
    element: <ReportDocument/>
  }
]