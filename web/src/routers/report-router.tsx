import WeeklyARReport from '@/pages/record/report/acknowledgement/WeeklyARReport';
import IRRecords from '@/pages/record/report/incident/IRRecords';
import IRFormLayout from '@/pages/record/report/incident/IRFormLayout';
import ARRecords from '@/pages/record/report/acknowledgement/ARRecords';
import ARFormLayout from '@/pages/record/report/acknowledgement/ARFormLayout';
import ActivityReportRecords from '@/pages/record/report/activity/ActivityReportRecords';

// Creating routes
export const report_router = [
  {
    path: '/weekly/report',
    element: <WeeklyARReport/>
  },
  {
    path: '/report/incident',
    element: <IRRecords/>
  },
  {
    path: '/report/incident/form',
    element: <IRFormLayout/>
  },
  {
    path: '/report/activity/',
    element: <ActivityReportRecords/>
  },
  {
    path: '/report/acknowledgement',
    element: <ARRecords/>
  },
  {
    path: '/report/acknowledgement/form',
    element: <ARFormLayout/>
  }
]