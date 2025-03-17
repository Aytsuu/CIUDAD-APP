import DRRMonthlyARReport from '@/pages/report/drr/DRR-MonthlyARReport';
import DRRWeeklyARReport from '@/pages/report/drr/DRR-WeeklyARReport';
import DRRResidentReport from '@/pages/report/drr/DRR-ResidentReport';
import DRRAcknowledgementReport from '@/pages/report/drr/DRR-AcknowledgementReport';
import DRRStaffRecord from '@/pages/record/drr/DRR-StaffRecord';

// Creating routes
export const drr_router = [
  {
    path: "/drr-monthly-report", 
    element: <DRRMonthlyARReport/>,
  },
  {
    path: '/drr-weekly-report',
    element: <DRRWeeklyARReport/>
  },
  {
    path: '/drr-resident-report',
    element: <DRRResidentReport/>
  },
  {
    path: '/drr-acknowledgement-report',
    element: <DRRAcknowledgementReport/>
  },
  {
    path: "/drr-staff",
    element: <DRRStaffRecord/>,
  }
]