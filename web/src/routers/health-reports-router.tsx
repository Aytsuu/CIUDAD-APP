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
// OPT
import MonthlyOPTRecords from "@/pages/healthServices/Reports/opt-tracking/monthly";
import MonthlyOPTDetails from "@/pages/healthServices/Reports/opt-tracking/records";
import OPTSummariesAllMonths from "@/pages/healthServices/Reports/opt-tracking-summary/monthly";
import OPTMonthlyDetails from "@/pages/healthServices/Reports/opt-tracking-summary/records";
import MasterListChildHealthSupplementsReport from "@/pages/healthServices/Reports/masterlist/opt-supplements-masterliist/masterlist";
import YearlySemiAnnualOPTRecords from "@/pages/healthServices/Reports/opt-semiannual/yearly";
import SemiAnnualOPTDetails from "@/pages/healthServices/Reports/opt-semiannual/records";
import YearlyJanDecOPTRecords from "@/pages/healthServices/Reports/opt-tracking-023mos.tsx/yearly";
import YearlyJanDecOPTDetails from "@/pages/healthServices/Reports/opt-tracking-023mos.tsx/records";

// EXPIRED
import MedicineProblemDetails from "@/pages/healthServices/Reports/inventory/medicine/expoutstock/records";
import FirstAidProblemDetails from "@/pages/healthServices/Reports/inventory/firstaid/expoutstock/records";
import CommodityProblemDetails from "@/pages/healthServices/Reports/inventory/commodity/expoutstock/records";
import AntigenProblemDetails from "@/pages/healthServices/Reports/inventory/antigen/expoutstock/records";


import MedicineInventoryReportsTabs from "@/pages/healthServices/Reports/inventory/medicine/Main";
import CommodityInventoryReportsTabs from "@/pages/healthServices/Reports/inventory/commodity/Main";
import FirstAidInventoryReportsTabs from "@/pages/healthServices/Reports/inventory/firstaid/Main";
import AntigenInventoryReportsTabs from "@/pages/healthServices/Reports/inventory/antigen/Main";

export const reports_router = [
  {
    path: "/bhwmonthlyreport",
    element: <BHWMonthlyReport />
  },
  {
    path: "/healthcare-reports",
    element: <HealthcareReports />
  },
  {
    path: "/monthly-medicine-records",
    element: <MonthlyMedicineRecords />
  },
  { path: "/monthly-medicine-details", element: <MonthlyMedicineDetails /> },
  {
    path: "/monthly-firstaid-records",
    element: <MonthlyFirstAidRecords />
  },
  { path: "/monthly-firstaid-details", element: <MonthlyFirstAidDetails /> },
  {
    path: "/edit-monthly-recipient-list",
    element: <EditMonthlyRecipientList />
  },
  {
    path: "/monthly-vaccine-records",
    element: <MonthlyVaccineRecords />
  },
  {
    path: "/monthly-vaccination-details",
    element: <MonthlyVaccinationDetails />
  },

  //  INVENTORY REPORTS
  { path: "/inventory-monthly-medicine-records", element: <InventoryMonthlyMedicineRecords /> },
  {
    path: "/inventory-monthly-medicine-details",
    element: <InventoryMonthlyMedicineDetails />
  },
  {
    path: "/inventory-monthly-commodity-records",
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
  },
  {
    path: "/monthly-opt-records",
    element: <MonthlyOPTRecords />
  },
  {
    path: "/monthly-opt-details",
    element: <MonthlyOPTDetails />
  },
  {
    path: "/opt-summaries-all-months",
    element: <OPTSummariesAllMonths />
  },
  {
    path: "/opt-summry-details",
    element: <OPTMonthlyDetails />
  },
  {
    path: "/child-supplements-masterlist",
    element: <MasterListChildHealthSupplementsReport />
  },
  {
    path: "/semiannual-opt-yearly",
    element: <YearlySemiAnnualOPTRecords />
  },
  {
    path: "/semiannual-opt-yearly/details",
    element: <SemiAnnualOPTDetails />
  },
  {
    path: "/yearly-opt-records-jantodec",
    element: <YearlyJanDecOPTRecords />
  },

  {
    path: "/yearly-opt-records-jantodec/details",
    element: <YearlyJanDecOPTDetails />
  },

  {
    path: "/medicine-expired-out-of-stock-summary/details",
    element: <MedicineProblemDetails />
  },

  {
    path: "/firstaid-expired-out-of-stock-summary/details",
    element: <FirstAidProblemDetails />
  },

  {
    path: "/commodity-expired-out-of-stock-summary/details",
    element: <CommodityProblemDetails />
  },
  {
    path: "/antigen-expired-out-of-stock-summary/details",
    element: <AntigenProblemDetails /> 
  },
  {
    path: "/medicine-inventory-reports",
    element: <MedicineInventoryReportsTabs />
  },
  {
    path: "/commodity-inventory-reports",
    element: <CommodityInventoryReportsTabs />
  },
  {
    path: "/firstaid-inventory-reports",
    element: <FirstAidInventoryReportsTabs />
  },
  {
    path: "/antigen-inventory-reports",
    element: <AntigenInventoryReportsTabs />
  },
 
];
