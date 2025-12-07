import WeeklyAR from '@/pages/record/report/weekly/WeeklyAR';
import IRRecords from '@/pages/record/report/incident/IRRecords';
import IRViewDetails from '@/pages/record/report/incident/IRViewDetails';
import ARRecords from '@/pages/record/report/acknowledgement/ARRecords';
import ARFormLayout from '@/pages/record/report/acknowledgement/ARFormLayout';
import ReportDocument from '@/pages/record/report/ReportDocument';
import CreateMissingWeeks from '@/pages/record/report/weekly/CreateMissingWeeks';
import SecuradoReports from '@/pages/record/report/securado/SecuradoReports';
import ResidentReports from '@/pages/record/report/resident/ResidentReports';
import RRArchive from '@/pages/record/report/resident/RRArchive';
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
    path: '/report/incident/archive/view',
    element: <IRViewDetails/>,
  },
  {
    path: '/report/resident/archive',
    element: <RRArchive/>,
  },
  {
    path: '/report/resident/archive/view',
    element: <IRViewDetails/>,
  },
  {
    path: '/report/resident/view',
    element: <IRViewDetails/>
  },
  {
    path: '/report/resident',
    element: <ResidentReports/>,
  },
  {
    path: '/report/securado',
    element: <SecuradoReports/>,
  },
  {
    path: '/report/action',
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
    path: '/report/action/form',
    element: <ARFormLayout/>
  },
  {
    path: '/report/action/document',
    element: <ReportDocument/>
  },
  {
    path: '/report/weekly-accomplishment/missing-report/create',
    element: <CreateMissingWeeks/>
  }
] 