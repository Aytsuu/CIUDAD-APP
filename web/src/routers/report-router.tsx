import WeeklyAR from '@/pages/record/report/weekly/WeeklyAR';
import IRRecords from '@/pages/record/report/incident/IRRecords';
import IRFormLayout from '@/pages/record/report/incident/IRFormLayout';
import ARRecords from '@/pages/record/report/acknowledgement/ARRecords';
import ARFormLayout from '@/pages/record/report/acknowledgement/ARFormLayout';
import ReportLayout from '@/pages/record/report/ReportLayout';
import { Navigate } from 'react-router';
import ReportDocument from '@/pages/record/report/ReportDocument';
import CreateMissingWeeks from '@/pages/record/report/weekly/CreateMissingWeeks';

// Creating routes
export const report_router = [
  {
    path: '/report/incident',
    element: <IRRecords/>
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
    path: '/report/incident/form',
    element: <IRFormLayout/>
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
    path: '/report/weekly/missing-report/create',
    element: <CreateMissingWeeks/>
  }
]