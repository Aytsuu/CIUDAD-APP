import BHWReportsMainTable from "@/pages/healthServices/Reports/bhw-report/bhw-main-table";
import BHWReportsForm from "@/pages/healthServices/Reports/bhw-report/bhw-m-accmplshmnt-form";

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



import MonthlyNewChildrenRecords from "@/pages/healthServices/Reports/newchildren-list-report/monthly";
import MonthlyNewChildrenRecordsDetails from "@/pages/healthServices/Reports/newchildren-list-report/records";
export const reports_router = [
  {
    path: "/bhw-monthly-reports",
    element: <BHWReportsMainTable />,
  },
  {
    path:"/bhw-accomplishment-reports",
    element: <BHWReportsForm />,
  },
  {
    path: "/reports",
    element: <HealthcareReports />
  },
  {
    path: "/reports/monthly-medicine",
    element: <MonthlyMedicineRecords />
  },
  { path: "/reports/monthly-medicine/records", element: <MonthlyMedicineDetails /> },
  {
    path: "/reports/monthly-firstaid",
    element: <MonthlyFirstAidRecords />
  },
  { path: "/reports/monthly-firstaid/records", element: <MonthlyFirstAidDetails /> },
  {
    path: "/edit-monthly-recipient-list",
    element: <EditMonthlyRecipientList />
  },
  {
    path: "/reports/monthly-vaccination",
    element: <MonthlyVaccineRecords />
  },
  {
    path: "/reports/monthly-vaccination/records",
    element: <MonthlyVaccinationDetails />
  },

  
  //  INVENTORY REPORTS
  { path: "/reports/monthly-inventory-medicine", element: <InventoryMonthlyMedicineRecords /> },
  {
    path: "/reports/monthly-inventory-medicine/records",
    element: <InventoryMonthlyMedicineDetails />
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
    path: "/antigen-expired-out-of-stock-summary/details",
    element: <AntigenProblemDetails />
  },
  {
    path: "/medicine-inventory-reports",
    element: <MedicineInventoryReportsTabs />
  },
  {
    path: "/reports/inventory/monthly-commodity",
    element: <CommodityInventoryReportsTabs />
  },
  {
    path: "/reports/inventory/monthly-commodity/transaction-records",
    element: <MonthlyCommodityDetails />
  },
  {
    path: "/reports/inventory/monthly-commodity/expoutstock-records",
    element: <CommodityProblemDetails />
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
