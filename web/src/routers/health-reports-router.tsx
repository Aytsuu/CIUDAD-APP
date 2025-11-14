// import BHWReportsMainTable from "@/pages/healthServices/reports/bhw-report/bhw-main-table";
// import BHWReportsForm from "@/pages/healthServices/reports/bhw-report/bhw-m-accmplshmnt-form";

import HealthcareReports from "@/pages/healthServices/reports/MainReports";
import MonthlyMedicineRecords from "@/pages/healthServices/reports/medicine-report/monthly";
import MonthlyMedicineDetails from "@/pages/healthServices/reports/medicine-report/records";
import MonthlyFirstAidRecords from "@/pages/healthServices/reports/firstaid-report/monthly";
import MonthlyFirstAidDetails from "@/pages/healthServices/reports/firstaid-report/records";
import EditMonthlyRecipientList from "@/pages/healthServices/reports/firstaid-report/edit-report";
import MonthlyVaccineRecords from "@/pages/healthServices/reports/vaccination-report/monthly";
import MonthlyVaccinationDetails from "@/pages/healthServices/reports/vaccination-report/records";

// INVENTORY REPORTS
import InventoryMonthlyMedicineRecords from "@/pages/healthServices/reports/inventory/medicine/monthly";
import InventoryMonthlyMedicineDetails from "@/pages/healthServices/reports/inventory/medicine/records";
import MonthlyCommodityDetails from "@/pages/healthServices/reports/inventory/commodity/records";
import MonthlyInventoryFirstAidRecords from "@/pages/healthServices/reports/inventory/firstaid/monthly";
import MonthlyInventoryFirstAidDetails from "@/pages/healthServices/reports/inventory/firstaid/records";
import MonthlyInventoryAntigenRecords from "@/pages/healthServices/reports/inventory/antigen/monthly";
import MonthlyInventoryAntigenDetails from "@/pages/healthServices/reports/inventory/antigen/records";
import InventoryMonthlyCommodityRecords from "@/pages/healthServices/reports/inventory/commodity/monthly";
// OPT
import MonthlyOPTRecords from "@/pages/healthServices/reports/opt-tracking/monthly";
import MonthlyOPTDetails from "@/pages/healthServices/reports/opt-tracking/records";
import OPTSummariesAllMonths from "@/pages/healthServices/reports/opt-tracking-summary/monthly";
import OPTMonthlyDetails from "@/pages/healthServices/reports/opt-tracking-summary/records";
import MasterListChildHealthSupplementsReport from "@/pages/healthServices/reports/masterlist/opt-supplements-masterliist/masterlist";
import YearlySemiAnnualOPTRecords from "@/pages/healthServices/reports/opt-semiannual/yearly";
import SemiAnnualOPTDetails from "@/pages/healthServices/reports/opt-semiannual/records";
import YearlyJanDecOPTRecords from "@/pages/healthServices/reports/opt-tracking-023mos.tsx/yearly";
import YearlyJanDecOPTDetails from "@/pages/healthServices/reports/opt-tracking-023mos.tsx/records";

// EXPIRED
import MedicineProblemDetails from "@/pages/healthServices/reports/inventory/medicine/expoutstock/records";
import FirstAidProblemDetails from "@/pages/healthServices/reports/inventory/firstaid/expoutstock/records";
import CommodityProblemDetails from "@/pages/healthServices/reports/inventory/commodity/expoutstock/records";
import AntigenProblemDetails from "@/pages/healthServices/reports/inventory/antigen/expoutstock/records";

import MonthlyNewChildrenRecords from "@/pages/healthServices/reports/newchildren-list-report/monthly";
import MonthlyNewChildrenRecordsDetails from "@/pages/healthServices/reports/newchildren-list-report/records";

import MultiStepFormFHIS from "@/pages/healthServices/reports/fhisreport/pages/main";
import FHSISMonthlyRecords from "@/pages/healthServices/reports/fhisreport/monthly";
import YearlyPopulationRecords from "@/pages/healthServices/reports/healthprofiling-report/yearly";
import PopulationStructureRecords from "@/pages/healthServices/reports/healthprofiling-report/records";
import HealthProfilingSummaryReport from "@/pages/healthServices/reports/healthprofiling-report/HealthProfilingSummaryReport";

// DOCTOR REPORTS
import MonthlyConsultedSummaries from "@/pages/healthServices/reports/doctor-reports/monthly";
import MonthlyConsultedDetails from "@/pages/healthServices/reports/doctor-reports/records";

import MonthlyMorbiditySummary from "@/pages/healthServices/reports/monthly_morbidity/monthly";
import MonthlyMorbidityDetails from "@/pages/healthServices/reports/monthly_morbidity/records";

export const healthreports_router = [
  // {
  //   path: "/bhw-monthly-reports",
  //   element: <BHWReportsMainTable />,
  // },
  // {
  //   path:"/bhw-accomplishment-reports",
  //   element: <BHWReportsForm />,
  // },
  {
    path: "/reports",
    element: <HealthcareReports />,
  },
  {
    path: "/reports/monthly-medicine",
    element: <MonthlyMedicineRecords />,
  },
  { path: "/reports/monthly-medicine/records", element: <MonthlyMedicineDetails /> },
  {
    path: "/reports/monthly-firstaid",
    element: <MonthlyFirstAidRecords />,
  },
  { path: "/reports/monthly-firstaid/records", element: <MonthlyFirstAidDetails /> },
  {
    path: "/edit-monthly-recipient-list",
    element: <EditMonthlyRecipientList />,
  },
  {
    path: "/reports/monthly-vaccination",
    element: <MonthlyVaccineRecords />,
  },
  {
    path: "/reports/monthly-vaccination/records",
    element: <MonthlyVaccinationDetails />,
  },

  //  INVENTORY REPORTS
  { path: "/reports/monthly-inventory-medicine", element: <InventoryMonthlyMedicineRecords /> },
  {
    path: "/reports/monthly-inventory-medicine/records",
    element: <InventoryMonthlyMedicineDetails />,
  },

  {
    path: "/inventory-monthly-firstaid-records",
    element: <MonthlyInventoryFirstAidRecords />,
  },
  {
    path: "/inventory-monthly-firstaid-details",
    element: <MonthlyInventoryFirstAidDetails />,
  },
  {
    path: "/reports/inventory/monthly-antigen",
    element: <MonthlyInventoryAntigenRecords />,
  },
  {
    path: "/inventory-monthly-antigen-details",
    element: <MonthlyInventoryAntigenDetails />,
  },
  {
    path: "/monthly-opt-records",
    element: <MonthlyOPTRecords />,
  },
  {
    path: "/monthly-opt-details",
    element: <MonthlyOPTDetails />,
  },
  {
    path: "/opt-summaries-all-months",
    element: <OPTSummariesAllMonths />,
  },
  {
    path: "/opt-summry-details",
    element: <OPTMonthlyDetails />,
  },
  {
    path: "/child-supplements-masterlist",
    element: <MasterListChildHealthSupplementsReport />,
  },
  {
    path: "/semiannual-opt-yearly",
    element: <YearlySemiAnnualOPTRecords />,
  },
  {
    path: "/semiannual-opt-yearly/details",
    element: <SemiAnnualOPTDetails />,
  },
  {
    path: "/yearly-opt-records-jantodec",
    element: <YearlyJanDecOPTRecords />,
  },

  {
    path: "/yearly-opt-records-jantodec/details",
    element: <YearlyJanDecOPTDetails />,
  },

  {
    path: "/medicine-expired-out-of-stock-summary/details",
    element: <MedicineProblemDetails />,
  },

  {
    path: "/firstaid-expired-out-of-stock-summary/details",
    element: <FirstAidProblemDetails />,
  },

  {
    path: "/antigen-expired-out-of-stock-summary/details",
    element: <AntigenProblemDetails />,
  },
  {
    path: "/medicine-inventory-reports",
    element: <InventoryMonthlyMedicineRecords />,
  },
  {
    path: "/reports/inventory/monthly-commodity",
    element: <InventoryMonthlyCommodityRecords />,
  },
  {
    path: "/reports/inventory/monthly-commodity/transaction-records",
    element: <MonthlyCommodityDetails />,
  },
  {
    path: "/reports/inventory/monthly-commodity/expoutstock-records",
    element: <CommodityProblemDetails />,
  },

  {
    path: "/firstaid-inventory-reports",
    element: <MonthlyInventoryFirstAidRecords />,
  },


  {
    path: "/monthly-new-children-records",
    element: <MonthlyNewChildrenRecords />,
  },
  {
    path: "/monthly-new-children-records/details",
    element: <MonthlyNewChildrenRecordsDetails />,
  },

  // ------FHIS
  {
    path: "/reports/fhis-monthly-records",
    element: <FHSISMonthlyRecords />,
  },
  {
    path: "/reports/fhis-monthly-records/details",
    element: <MultiStepFormFHIS />,
  },

  // Health Profiling Population Structure Report
  {
    path: "/health-family-profiling",
    element: <YearlyPopulationRecords />,
  },
  {
    path: "/health-family-profiling/records",
    element: <PopulationStructureRecords />,
  },
  {
    path: "/health-family-profiling/summary",
    element: <HealthProfilingSummaryReport />,
  },

  // DOCTOR REPORTS
  {
    path: "/reports/monthly-consulted-summaries",
    element: <MonthlyConsultedSummaries />,
  },
  {
    path: "/reports/monthly-consulted-summaries/records",
    element: <MonthlyConsultedDetails />,
  },
  {
    path: "/reports/monthly-morbidity-summary",
    element: <MonthlyMorbiditySummary />,
  },
  {
    path: "/reports/monthly-morbidity-summary/records",
    element: <MonthlyMorbidityDetails />,
  },



  // DOCTOR REPORTS - TODO: Add these components when they are created
  // {
  //   path: "/reports/monthly-consulted-summaries",
  //   element: <MonthlyConsultedSummaries />
  // },
  // {
  //   path: "/reports/monthly-consulted-summaries/records",
  //   element: <MonthlyConsultedDetails />
  // },
];
