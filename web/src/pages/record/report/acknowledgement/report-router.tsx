import MonthlyARReport from '@/pages/record/report/acknowledgement/MonthlyARReport';
import WeeklyARReport from '@/pages/record/report/acknowledgement/WeeklyARReport';
import IRRecords from '@/pages/record/report/incident/IRRecords';
import IRFormLayout from '@/pages/record/report/incident/IRFormLayout';
import ARRecords from '@/pages/record/report/acknowledgement/ARRecords';
import ARFormLayout from '@/pages/record/report/acknowledgement/ARFormLayout';

// Creating routes
export const report_router = [
  {
    path: "/monthly/report", 
    element: <MonthlyARReport/>,
  },
  {
    path: '/weekly/report',
    element: <WeeklyARReport/>
  },
  {
    path: '/incident/report',
    element: <IRRecords/>
  },
  {
    path: '/incident/report/form',
    element: <IRFormLayout/>
  },
  {
    path: '/acknowledgement/report',
    element: <ARRecords/>
  },
  {
    path: '/acknowledgement/report/form',
    element: <ARFormLayout/>
  }
]