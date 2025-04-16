import MonthlyARReport from '@/pages/report/drr/acknowledgement-report/MonthlyARReport';
import WeeklyARReport from '@/pages/report/drr/acknowledgement-report/WeeklyARReport';
import DRRResidentReport from '@/pages/report/drr/DRRResidentReport';
import ARRecords from '@/pages/report/drr/acknowledgement-report/ARRecords';
import ARFormLayout from '@/pages/report/drr/acknowledgement-report/ARFormLayout';
import DRRStaffRecord from '@/pages/record/drr/DRR-StaffRecord';

// Creating routes
export const drr_router = [
  {
    path: "/drr/monthly-report", 
    element: <MonthlyARReport/>,
  },
  {
    path: '/drr/weekly-report',
    element: <WeeklyARReport/>
  },
  {
    path: '/drr/resident-report',
    element: <DRRResidentReport/>
  },
  {
    path: '/drr/acknowledgement-report',
    element: <ARRecords/>
  },
  {
    path: '/drr/acknowledgement-report/form',
    element: <ARFormLayout/>
  },
  {
    path: "/drr/staff",
    element: <DRRStaffRecord/>,
  }
]