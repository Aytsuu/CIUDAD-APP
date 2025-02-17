import DRRMonthlyARReport from '@/pages/report/drr/drr-monthly-ar-report';
import DRRWeeklyARReport from '@/pages/report/drr/drr-weekly-ar-report';
import DRRResidentReport from '@/pages/report/drr/drr-resident-report';
import DRRAcknowledgementReport from '@/pages/report/drr/drr-acknowledgement-report';
import DRRStaffRecord from '@/pages/record/drr/drr-staff-record';

// Creating routes
export const drr_router = [
  {
    path: "/drr-monthly-report", 
    element: <DRRMonthlyARReport/>,
    children: [
      {
        path: ':month',
        element: <DRRWeeklyARReport/>
      }
    ]
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