import BHWMonthlyReport from "@/pages/bhw/bhw-monthly-report";
import HealthcareReports from "@/pages/healthServices/reports_tmp/MainReports";
import MonthlyMedicineRecords from "@/pages/healthServices/reports_tmp/medicine-report/monthly";
import MonthlyMedicineDetails from "@/pages/healthServices/reports_tmp/medicine-report/records";
import MonthlyFirstAidRecords from "@/pages/healthServices/reports_tmp/firstaid-report/monthly";
import MonthlyFirstAidDetails from "@/pages/healthServices/reports_tmp/firstaid-report/records";
import EditMonthlyRecipientList from "@/pages/healthServices/reports_tmp/firstaid-report/edit-report";
import MonthlyVaccineRecords from "@/pages/healthServices/reports_tmp/vaccination-report/monthly";
import MonthlyVaccinationDetails from "@/pages/healthServices/reports_tmp/vaccination-report/records";

// iINVENTORY REPORTS
import InventoryMonthlyMedicineRecords from "@/pages/healthServices/reports_tmp/inventory/medicine/monthly";
import InventoryMonthlyMedicineDetails from "@/pages/healthServices/reports_tmp/inventory/medicine/records";
import InventoryMonthlyCommodityRecords from "@/pages/healthServices/reports_tmp/inventory/commodity/monthly";
import MonthlyCommodityDetails from "@/pages/healthServices/reports_tmp/inventory/commodity/records";
import MonthlyInventoryFirstAidRecords from "@/pages/healthServices/reports_tmp/inventory/firstaid/monthly";
import MonthlyInventoryFirstAidDetails from "@/pages/healthServices/reports_tmp/inventory/firstaid/records";
import MonthlyInventoryAntigenRecords from "@/pages/healthServices/reports_tmp/inventory/antigen/monthly";
import MonthlyInventoryAntigenDetails from "@/pages/healthServices/reports_tmp/inventory/antigen/records";
// OPT
import MonthlyOPTRecords from "@/pages/healthServices/reports_tmp/opt-tracking/monthly";
import MonthlyOPTDetails from "@/pages/healthServices/reports_tmp/opt-tracking/records";
import OPTSummariesAllMonths from "@/pages/healthServices/reports_tmp/opt-tracking-summary/monthly";
import OPTMonthlyDetails from "@/pages/healthServices/reports_tmp/opt-tracking-summary/records";
import MasterListChildHealthSupplementsReport from "@/pages/healthServices/reports_tmp/masterlist/opt-supplements-masterliist/masterlist";
import YearlySemiAnnualOPTRecords from "@/pages/healthServices/reports_tmp/opt-semiannual/yearly";
import SemiAnnualOPTDetails from "@/pages/healthServices/reports_tmp/opt-semiannual/records";
import YearlyJanDecOPTRecords from "@/pages/healthServices/reports_tmp/opt-tracking-023mos.tsx/yearly";
import YearlyJanDecOPTDetails from "@/pages/healthServices/reports_tmp/opt-tracking-023mos.tsx/records";

// EXPIRED
import MedicineProblemDetails from "@/pages/healthServices/reports_tmp/inventory/medicine/expoutstock/records";
import FirstAidProblemDetails from "@/pages/healthServices/reports_tmp/inventory/firstaid/expoutstock/records";
import CommodityProblemDetails from "@/pages/healthServices/reports_tmp/inventory/commodity/expoutstock/records";
import AntigenProblemDetails from "@/pages/healthServices/reports_tmp/inventory/antigen/expoutstock/records";


import MedicineInventoryReportsTabs from "@/pages/healthServices/reports_tmp/inventory/medicine/Main";
import CommodityInventoryReportsTabs from "@/pages/healthServices/reports_tmp/inventory/commodity/Main";
import FirstAidInventoryReportsTabs from "@/pages/healthServices/reports_tmp/inventory/firstaid/Main";
import AntigenInventoryReportsTabs from "@/pages/healthServices/reports_tmp/inventory/antigen/Main";



import MonthlyNewChildrenRecords from "@/pages/healthServices/reports_tmp/newchildren-list-report/monthly";
import MonthlyNewChildrenRecordsDetails from "@/pages/healthServices/reports_tmp/newchildren-list-report/records";
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
 
  {
    path: "/monthly-new-children-records",
    element: <MonthlyNewChildrenRecords />
  },
  {
    path: "/monthly-new-children-records/details",
    element: <MonthlyNewChildrenRecordsDetails />
  }

];
