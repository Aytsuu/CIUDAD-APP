import BHWMonthlyReport from "@/pages/bhw/bhw-monthly-report";
import HealthcareReports from "@/pages/healthServices/Reports/MainReports";
import MonthlyMedicineRecords from "@/pages/healthServices/Reports/medicine-report/monthly";
import MonthlyMedicineDetails from "@/pages/healthServices/Reports/medicine-report/records";
import MonthlyFirstAidRecords from "@/pages/healthServices/Reports/firstaid-report/monthly";
import MonthlyFirstAidDetails from "@/pages/healthServices/Reports/firstaid-report/records";
import EditMonthlyRecipientList from "@/pages/healthServices/Reports/firstaid-report/edit-report";
import MonthlyVaccineRecords from "@/pages/healthServices/Reports/vaccination-report/monthly";
import MonthlyVaccinationDetails from "@/pages/healthServices/Reports/vaccination-report/records";

// iINVENTORY REPORTS
import InventoryMonthlyMedicineRecords from "@/pages/healthServices/Reports/inventory/medicine/monthly";
import InventoryMonthlyMedicineDetails from "@/pages/healthServices/Reports/inventory/medicine/records";
import InventoryMonthlyCommodityRecords from "@/pages/healthServices/Reports/inventory/commodity/monthly";
import MonthlyCommodityDetails from "@/pages/healthServices/Reports/inventory/commodity/records";
import MonthlyInventoryFirstAidRecords from "@/pages/healthServices/Reports/inventory/firstaid/monthly";
import MonthlyInventoryFirstAidDetails from "@/pages/healthServices/Reports/inventory/firstaid/records";
import MonthlyInventoryAntigenRecords from "@/pages/healthServices/Reports/inventory/antigen/monthly";
import MonthlyInventoryAntigenDetails from "@/pages/healthServices/Reports/inventory/antigen/records"; 
import path from "path";

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
   },
   {
    path: "/monthly-vaccine-records",
    element: <MonthlyVaccineRecords />
   },
   {
    path:"/monthly-vaccination-details",
    element: <MonthlyVaccinationDetails />
   },


  //  INVENTORY REPORTS
  { path: "/inventory-monthly-medicine-records",
    element: <InventoryMonthlyMedicineRecords />
  },
  {
    path: "/inventory-monthly-medicine-details",
    element: <InventoryMonthlyMedicineDetails />
  },
  {
    path  : "/inventory-monthly-commodity-records",
    element: <InventoryMonthlyCommodityRecords />
  },
  {
    path: "/inventory-monthly-commodity-details",
    element: <MonthlyCommodityDetails />
  },
  {
    path: "/inventory-monthly-firstaid-records",
    element: <MonthlyInventoryFirstAidRecords />
  },
  {
    path: "/inventory-monthly-firstaid-details",
    element: <MonthlyInventoryFirstAidDetails />
  },
  {
    path: "/inventory-monthly-antigen-records",
    element: <MonthlyInventoryAntigenRecords />
  },
  {

  path: "/inventory-monthly-antigen-details",
    element: <MonthlyInventoryAntigenDetails />

  }
   
];
