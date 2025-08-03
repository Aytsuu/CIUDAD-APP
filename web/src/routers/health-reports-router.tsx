import BHWMonthlyReport from "@/pages/bhw/bhw-monthly-report";
import HealthcareReports from "@/pages/healthServices/Reports/MainReports";
import MonthlyMedicineRecords from "@/pages/healthServices/Reports/medicine-report/monthly";
import MonthlyMedicineDetails from "@/pages/healthServices/Reports/medicine-report/records";
import MonthlyFirstAidRecords from "@/pages/healthServices/Reports/firstaid-report/monthly";
import MonthlyFirstAidDetails from "@/pages/healthServices/Reports/firstaid-report/records";
import EditMonthlyRecipientList from "@/pages/healthServices/Reports/firstaid-report/edit-report";


export const reports_router = [
  {
    path: "/bhwmonthlyreport",
    element: <BHWMonthlyReport />,
  },
  {
    path: "/healthcare-reports",
    element: <HealthcareReports />,
  },
  {
    path: "/monthly-medicine-records",
    element: <MonthlyMedicineRecords />,
  },
  { path: "/monthly-medicine-details", 
    element: <MonthlyMedicineDetails /> },
  {
    path: "/monthly-firstaid-records",
    element: <MonthlyFirstAidRecords />,
  },
  { path: "/monthly-firstaid-details",
     element: <MonthlyFirstAidDetails /> 
   },
   {
    path: "/edit-monthly-recipient-list",
    element: <EditMonthlyRecipientList />
   }

];
