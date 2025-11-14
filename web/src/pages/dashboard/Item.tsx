import { useAdminSectionCards } from "@/components/analytics/administration/admin-section-cards";
import { useProfilingSectionCards } from "@/components/analytics/profiling/profiling-section-cards";
import { ProfilingSidebar } from "@/components/analytics/profiling/profiling-sidebar";
import { useReportSectionCards } from "@/components/analytics/report/report-section-cards";
import ReportSectionCharts from "@/components/analytics/report/report-section-charts";
import { ReportSidebar } from "@/components/analytics/report/report-sidebar";

// HEALTH SERVICES
import { useHealthServicesSectionCards } from "@/components/analytics/health/services-count-cards";
import { MedicineDistributionChart } from "@/components/analytics/health/medicine-chart";
import { OPTStatusChart } from "@/components/analytics/health/opt-tracking-chart";
import { format } from "date-fns";
import { MedicalHistoryMonthlyChart } from "@/components/analytics/health/illness-chart";
import { useAuth } from "@/context/AuthContext";
import { MaternalAgeDistributionChart } from "@/components/analytics/health/maternal-age-chart";
import { PendingMedicalAppointmentsSidebar } from "@/components/analytics/health/pending-medapp-sidebar";
import { PendingMedicineRequestsSidebar } from "@/components/analytics/health/pending-medreq-sidebar";
import { AnimalBiteAnalyticsCharts } from "@/components/analytics/animalbites/animal-bite-analytics-charts";
// import { AnimalBiteSectionCards } from "@/components/analytics/animalbites/animal-bite-section-cards";
import FamilyPlanningAnalytics from "@/components/analytics/famplanning/fp-analytic";
// import { PendingPrenatalAppSidebar } from "@/components/analytics/health/pending-prenatalapp-sidebar";
// import { SchedulerSidebar } from "@/components/analytics/health/scheduler-sidebar";
import { ReferredPatientsSidebar } from "@/components/analytics/health/referred_patients";
import { ToPickupMedicineRequestsSidebar } from "@/components/analytics/health/topickup-sidebar";
import { VaccineResidentChart } from "@/components/analytics/health/vaccine-chart";
import { MedicineAlertsSidebar } from "@/components/analytics/health/invmedicine_sidebar";
import { AntigenAlertsSidebar } from "@/components/analytics/health/invantigen_sidebar";
import {FirstAidAlertsSidebar} from "@/components/analytics/health/invfirstaid_sidebar";
import { CommodityAlertsSidebar } from "@/components/analytics/health/invcommodity_sidebar";


import { useWastePersonnelSectionCards } from "@/components/analytics/waste/wastepersonnel-section-cards";
import { useGarbagePickupSectionCards } from "@/components/analytics/waste/garbage-picukup-section-cards";
import { useDonationSectionCards } from "@/components/analytics/donation/donation-cash-section-cards";
import { GADQuarterlyBudgetChart } from "@/components/analytics/gad/btracker-quarterly-report";
import { GADExpenseSidebar } from "@/components/analytics/gad/btracker-sidebar";
import { ProjectProposalSidebar } from "@/components/analytics/gad/projprop-sidebar";
import { DisbursementSidebar } from "@/components/analytics/treasurer/disbursement-sidebar";
import { IncomeExpenseQuarterlyChart } from "@/components/analytics/treasurer/expense-quarterly-report";
import { IncomeQuarterlyChart } from "@/components/analytics/treasurer/income-quartertly-report";
import { BudgetPlanSidebar } from "@/components/analytics/treasurer/budgetplan-sidebar";

// *  OBJECT PROPERTIES: dashboard, card, sidebar, chart  * //
export const getItemsConfig = (
  profilingCards: ReturnType<typeof useProfilingSectionCards>,
  administrationCards: ReturnType<typeof useAdminSectionCards>,
  reportCards: ReturnType<typeof useReportSectionCards>,
  healthCards: ReturnType<typeof useHealthServicesSectionCards>,
  wasteCards: ReturnType<typeof useWastePersonnelSectionCards>,
  donationCards: ReturnType<typeof useDonationSectionCards>,
  garbCards: ReturnType<typeof useGarbagePickupSectionCards>
) => {
  const { user } = useAuth();
  const currentMonth = format(new Date(), "yyyy-MM");
  const currentYear= format(new Date(), "yyyy");
  const { residents, families, households, businesses } = profilingCards;
  const { staffs } = administrationCards;
  const { incidentReports, acknowledgementReports, weeklyARs } = reportCards;

  const { childHealth, firstAid, medicine, vaccinations, consultations, animalBites, familyPlanning, maternal, consultationsByDoctor, chilrenConsulted } = healthCards;
  const { driverLoaders, wasteLoaders, collectionVehicles } = wasteCards;
  const { accepted, rejected, completed, pending } = garbCards;
  const { cashDonations } = donationCards;

  if (user?.staff?.staff_type.toLowerCase() == "barangay staff") {
    return [
      {
        dashboard: "ADMINISTRATION",
        card: [staffs],
      },
      {
        dashboard: "PROFILING",
        card: [residents, families, households, businesses],
        sidebar: [
          {
            title: "Resident Registration",
            element: <ProfilingSidebar />,
          },
        ],
      },
      {
        dashboard: "REPORT",
        card: [incidentReports, acknowledgementReports, weeklyARs],
        chart: [
          {
            title: "Incident Report",
            element: <ReportSectionCharts />,
          },
        ],
        sidebar: [
          {
            title: "Incident Reports",
            element: <ReportSidebar />,
          },
        ],
      },
      {
        dashboard: "COMPLAINT",
      },
      {
        dashboard: "SUMMON & CASE TRACKER",
      },
      {
        dashboard: "GAD",
        chart: [
          {
            title: "GAD Budget Overview",
            element: <GADQuarterlyBudgetChart />,
          },
        ],
        sidebar: [
          {
            title: "GAD Recent Expenses",
            element: <GADExpenseSidebar />,
          },
          {
            title: "Recent Project Proposal",
            element: <ProjectProposalSidebar />,
          },
        ],
      },
      {
        dashboard: "COUNCIL",
      },
      {
        dashboard: "FINANCE",
        chart: [
          {
            title: "Finance Expense Overview",
            element: <IncomeExpenseQuarterlyChart />,
          },
          {
            title: "Finance Income Overview",
            element: <IncomeQuarterlyChart />,
          },
        ],
        sidebar: [
          {
            title: "Recent Disbursement Voucher",
            element: <DisbursementSidebar />,
          },
          {
            title: "Current Budget Plan",
            element: <BudgetPlanSidebar />,
          },
        ],
      },
      {
        dashboard: "CERTIFICATE & CLEARANCES",
      },
      {
        dashboard: "DONATION",
      },
      {
        dashboard: "WASTE",
        card: [cashDonations],
      },
      {
        dashboard: "WASTE",
        card: [driverLoaders, wasteLoaders, collectionVehicles, pending, rejected, accepted, completed],
      },
    ]
  }

  if (user?.staff?.staff_type.toLowerCase() == "health staff") {
    return [
      {
        dashboard: "ADMINISTRATION",
        card: [staffs],
      },
      {
        dashboard: "PROFILING",
        card: [residents, families, households],
        sidebar: [
          {
            title: "Recent Registration",
            element: <ProfilingSidebar />,
          },
        ],
      },
      {
        dashboard: "SERVICES",
        card: [childHealth, firstAid, medicine, vaccinations, consultations, animalBites, familyPlanning, maternal],

        chart: [
          {
            title: "0-72 mos Nutritional Status",
            element: <OPTStatusChart initialMonth={currentMonth} />,
          },
          {
            title: "Morbidity",
            element: <MedicalHistoryMonthlyChart initialMonth={currentMonth} />,
          },
         
        {
          title: "Maternal",
          element: <MaternalAgeDistributionChart initialMonth={currentMonth} />
        },
        {
          title: "Animal Bites",
          element: <AnimalBiteAnalyticsCharts initialMonth={currentMonth} />,
        },
        {
          title: "Family Planning",
          element: <FamilyPlanningAnalytics initialMonth={currentMonth} />,
        },
        {
          title: "Vaccination",
          element: <VaccineResidentChart initialYear={currentYear} />,
        },
          {
            title: "Medicine",
            element: <MedicineDistributionChart initialMonth={currentMonth} />,
          },
        

        ],
        sidebar: [
          {
            title: "Pending Medical Appointments",
            element: <PendingMedicalAppointmentsSidebar />,
          },
          // {
          //   title: "Pending Prenatal Appointments",
          //   element: <PendingPrenatalAppSidebar />,
          // },
          {
            title: "Pending Medicine Requests",
            element: <PendingMedicineRequestsSidebar />,
          },
          { title: "To-Pickup Medicine Requests", element: <ToPickupMedicineRequestsSidebar /> },
        ],
      },

      {
        dashboard: "INVENTORY",
        sidebar: [

          {
            title: "Medicine Alerts",
            element: <MedicineAlertsSidebar />,
          },
          {
            title: "Antigen Alerts",
            element: <AntigenAlertsSidebar />,
          },
          { title: "First Aid Alerts",
            element: <FirstAidAlertsSidebar />,
          },
          { title: "Commodity Alerts",
            element: <CommodityAlertsSidebar />,
          }
       
        ],
      },
      {
        dashboard: "REFERRED PATIENTS",
        card: [consultationsByDoctor, chilrenConsulted],

        sidebar: [
          {
            title: "Referred Patients",
            element: <ReferredPatientsSidebar />,
          },
        ],
      },
    ];
  } else return [];
};
