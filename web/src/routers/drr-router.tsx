import MonthlyARReport from '@/pages/report/drr/MonthlyARReport';
import WeeklyARReport from '@/pages/report/drr/WeeklyARReport';
import DRRResidentReport from '@/pages/report/drr/DRRResidentReport';
import AcknowledgementReport from '@/pages/report/drr/AcknowledgementReport';
import DRRStaffRecord from '@/pages/record/drr/DRR-StaffRecord';

// Creating routes
export const drr_router = [
  {
    path: "/drr-monthly-report", 
    element: <MonthlyARReport/>,
  },
  {
    path: '/drr-weekly-report',
    element: <WeeklyARReport/>
  },
  {
    path: '/drr-resident-report',
    element: <DRRResidentReport/>
  },
  {
    path: '/drr-acknowledgement-report',
    element: <AcknowledgementReport/>
  },
  {
    path: "/drr-staff",
    element: <DRRStaffRecord/>,
  }
]