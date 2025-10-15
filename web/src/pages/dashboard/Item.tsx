import { useAdminSectionCards } from "@/components/analytics/administration/admin-section-cards";
import { useProfilingSectionCards } from "@/components/analytics/profiling/profiling-section-cards";
import { ProfilingSidebar } from "@/components/analytics/profiling/profiling-sidebar";
import { useReportSectionCards } from "@/components/analytics/report/report-section-cards";
import ReportSectionCharts from "@/components/analytics/report/report-section-charts";
import { ReportSidebar } from "@/components/analytics/report/report-sidebar";
import { useHealthServicesSectionCards } from "@/components/analytics/health/services-count-cards";
import { MedicineDistributionSidebar } from "@/components/analytics/health/medicine-sidebar";
import { OPTStatusChart } from "@/components/analytics/health/opt-tracking-chart";
import { format } from "date-fns";
import { MedicalHistoryMonthlyChart } from "@/components/analytics/health/illness-chart";
import { VaccineDistributionChart } from "@/components/analytics/health/vaccine-chart";
import { FirstAidDistributionSidebar } from "@/components/analytics/health/firstaid-sidebar";
import { useAuth } from "@/context/AuthContext";
import { useWastePersonnelSectionCards } from "@/components/analytics/waste/wastepersonnel-section-cards";
import { useDonationSectionCards } from "@/components/analytics/donation/donation-cash-section-cards";
import { GADQuarterlyBudgetChart } from "@/components/analytics/gad/btracker-quarterly-report"; 
import { GADExpenseSidebar } from "@/components/analytics/gad/btracker-sidebar"; 
import { ProjectProposalSidebar } from "@/components/analytics/gad/projprop-sidebar";
import { DisbursementSidebar } from "@/components/analytics/treasurer/disbursement-sidebar";
import { IncomeExpenseQuarterlyChart } from "@/components/analytics/treasurer/expense-quarterly-report";
import { IncomeQuarterlyChart } from "@/components/analytics/treasurer/income-quartertly-report";


// *  OBJECT PROPERTIES: dashboard, card, sidebar, chart  * //
export const getItemsConfig = (
  profilingCards: ReturnType<typeof useProfilingSectionCards>,
  administrationCards: ReturnType<typeof useAdminSectionCards>,
  reportCards: ReturnType<typeof useReportSectionCards>,
  healthCards: ReturnType<typeof useHealthServicesSectionCards>,
  wasteCards: ReturnType<typeof useWastePersonnelSectionCards>,
  donationCards: ReturnType<typeof useDonationSectionCards>,
) => {
  const { user } = useAuth();
  const currentMonth = format(new Date(), "yyyy-MM");
  const { residents, families, households, businesses } = profilingCards;
  const { staffs } = administrationCards;
  const { incidentReports, acknowledgementReports, weeklyARs } = reportCards;
  const {
    childHealth,
    firstAid,
    medicine,
    vaccinations,
    consultations,
    animalBites,
    familyPlanning,
    maternal,
  } = healthCards;
  const { driverLoaders, wasteLoaders, collectionVehicles } = wasteCards;
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
            title: "Recent Registration",
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
            title: "Recent Incident Reports",
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
            element: <IncomeExpenseQuarterlyChart/>,
          },
          {
            title: "Finance Income Overview",
            element: <IncomeQuarterlyChart/>,
          },
        ],
        sidebar: [
          {
            title: "Recent Disbursement Voucher",
            element: <DisbursementSidebar />,
          },
        ],
      },
      {
        dashboard: "CERTIFICATE & CLEARANCES",
      },
      {
        dashboard: "DONATION",
         card: [cashDonations],
      },
      {
        dashboard: "WASTE",
        card: [driverLoaders, wasteLoaders, collectionVehicles], 
      },
    ];
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
        card: [
          childHealth,
          firstAid,
          medicine,
          vaccinations,
          consultations,
          animalBites,
          familyPlanning,
          maternal,
        ],
        sidebar: [
          {
            title: "Most Requested Medicine",
            element: <MedicineDistributionSidebar />,
          },
          {
            title: "Most used FirstAid",
            element: <FirstAidDistributionSidebar />,
          },
        ],
        chart: [
          {
            title: "Growth",
            element: <OPTStatusChart initialMonth={currentMonth} />,
          },
          {
            title: "Medical History",
            element: <MedicalHistoryMonthlyChart initialMonth={currentMonth} />,
          },
          {
            title: "Vaccination",
            element: <VaccineDistributionChart initialMonth={currentMonth} />,
          },
        ],
      },

      {
        dashboard: "INVENTORY",
        sidebar: [
          {
            title: "Most Requested Medicine",
            element: <MedicineDistributionSidebar />,
          },
          {
            title: "Most used FirstAid",
            element: <FirstAidDistributionSidebar />,
          },
        ],
      },
    ];
    
  } else return []
};