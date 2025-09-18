import WeeklyAR from '@/pages/record/report/weekly/WeeklyAR';
import IRRecords from '@/pages/record/report/incident/IRRecords';
import IRViewDetails from '@/pages/record/report/incident/IRViewDetails';
import ARRecords from '@/pages/record/report/acknowledgement/ARRecords';
import ARFormLayout from '@/pages/record/report/acknowledgement/ARFormLayout';
import ReportDocument from '@/pages/record/report/ReportDocument';
import CreateMissingWeeks from '@/pages/record/report/weekly/CreateMissingWeeks';
import IRArchive from '@/pages/record/report/incident/IRArchive';

// Creating routes
export const report_router = [
  {
    path: '/report/incident',
    element: <IRRecords/>,
  },
  {
    path: '/report/incident/archive',
    element: <IRArchive/>,
  },
  {
    path: '/report/acknowledgement',
    element: <ARRecords/>
  },
  {
    path: '/report/weekly-accomplishment',
    element: <WeeklyAR/>
  },
  {
    path: '/report/incident/view',
    element: <IRViewDetails/>
  },
  {
    path: '/report/acknowledgement/form',
    element: <ARFormLayout/>
  },
  {
    path: '/report/acknowledgement/document',
    element: <ReportDocument/>
  },
  {
    path: '/report/weekly-accomplishment/missing-report/create',
    element: <CreateMissingWeeks/>
  }
]