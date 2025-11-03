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
import { FirstAidDistributionSidebar } from "@/components/analytics/health/firstaid-sidebar";
import { useAuth } from "@/context/AuthContext";
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
import { useCertificateSectionCards } from "@/components/analytics/certificate/certificate-section-cards";
import { CertificatePurposeChart } from "@/components/analytics/certificate/certificate-purpose-chart";
import { CertificateSidebar } from "@/components/analytics/certificate/certificate-sidebar";
import { BusinessSidebar } from "@/components/analytics/certificate/business-sidebar";
import { useCouncilUpcomingEvents } from "@/components/analytics/council/ce-event-bar";
import { ReactElement } from "react";

type DashboardItem = {
  dashboard: string;
  card?: ReactElement[];
  sidebar?: { title: string; element: ReactElement }[];
  chart?: { title: string; element: ReactElement }[];
  upcomingEvents?: ReactElement;
};import { useMediationSectionCards } from "@/components/analytics/summon/mediation-analytics-section-cards";
import { useConciliationSectionCards } from "@/components/analytics/summon/conciliation-analytics-section-cards";
import { useNoRemarksSectionCard } from "@/components/analytics/summon/remarks-analytics-section-cards";
import { MaternalAgeDistributionChart } from "@/components/analytics/health/maternal-age-chart";
import { VaccinationDistributionSidebar } from "@/components/analytics/health/vaccination-sidebar";
// *  OBJECT PROPERTIES: dashboard, card, sidebar, chart  * //
export const getItemsConfig = (
  profilingCards: ReturnType<typeof useProfilingSectionCards>,
  administrationCards: ReturnType<typeof useAdminSectionCards>,
  reportCards: ReturnType<typeof useReportSectionCards>,
  healthCards: ReturnType<typeof useHealthServicesSectionCards>,
  wasteCards: ReturnType<typeof useWastePersonnelSectionCards>,
  donationCards: ReturnType<typeof useDonationSectionCards>,
  garbCards: ReturnType<typeof useGarbagePickupSectionCards>,
  certificateCards: ReturnType<typeof useCertificateSectionCards>,
  conciliationCards: ReturnType<typeof useConciliationSectionCards>,
  mediationCards: ReturnType<typeof useMediationSectionCards>,
  remarkCard: ReturnType<typeof useNoRemarksSectionCard>,
  councilEvents: ReturnType<typeof useCouncilUpcomingEvents>,
): DashboardItem[] => {
  const { user } = useAuth();
  const currentMonth = format(new Date(), "yyyy-MM");
  const { upcomingEvents: councilUpcomingEvents } = councilEvents;
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
  const {accepted, rejected, completed, pending} = garbCards;
  const { waiting, ongoing, escalated, resolved} = conciliationCards;
  const { waiting: mediationWaiting, ongoing: mediationOngoing, forwarded, resolved: mediationResolved} = mediationCards;
  const { cashDonations } = donationCards;
  const { noRemark } = remarkCard;
  const { 
    totalCertificates, 
    totalIssued, 
    totalPending, 
    totalCompleted, 
    totalRejected, 
    completionRate, 
    avgProcessingDays,
    // Business Permit Cards
    totalBusinessPermits,
    totalIssuedPermits,
    totalPendingPermits,
    totalCompletedPermits,
    totalRejectedPermits,
    permitCompletionRate,
    avgPermitProcessingDays
  } = certificateCards;

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
        card: []
      },
      {
        dashboard: "CONCILIATION PROCEEDINGS",
        card: [waiting, ongoing, escalated, resolved], 
      },
      {
        dashboard: "COUNCIL MEDIATION",
        card: [mediationWaiting, mediationOngoing, forwarded, mediationResolved], 
      },
      {
        dashboard: "SUMMON REMARKS",
        card: [noRemark]
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
        upcomingEvents: councilUpcomingEvents,
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
          {
            title: "Current Budget Plan",
            element: <BudgetPlanSidebar />,
          },
        ],
      },
      {
        dashboard: "CERTIFICATE & CLEARANCES",
        card: [
          totalCertificates,
          totalIssued,
          totalPending,
          totalCompleted,
          totalRejected,
          completionRate,
          avgProcessingDays,
          // Business Permit Cards
          totalBusinessPermits,
          totalIssuedPermits,
          totalPendingPermits,
          totalCompletedPermits,
          totalRejectedPermits,
          permitCompletionRate,
          avgPermitProcessingDays,
        ],
        chart: [
          {
            title: "Certificate & Permit Overview",
            element: <CertificatePurposeChart initialMonths={12} />,
          },
        ],
        sidebar: [
          {
            title: "Recent Certificate Requests",
            element: <CertificateSidebar />,
          },
          {
            title: "Recent Business Permit Requests",
            element: <BusinessSidebar />,
          },
        ],
      },
      {
        dashboard: "DONATION",
         card: [cashDonations],
      },
      {
        dashboard: "WASTE",
        card: [driverLoaders, wasteLoaders, collectionVehicles, pending, rejected, accepted, completed], 
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

        chart: [
          {
            title: "OPT",
            element: <OPTStatusChart initialMonth={currentMonth} />,
          },
          {
            title: "Medical History",
            element: <MedicalHistoryMonthlyChart initialMonth={currentMonth} />,
          },
         
        {
          title: "Maternal",
          element: <MaternalAgeDistributionChart initialMonth={currentMonth} />
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
          {
            title:"Administered Vaccination",
            element:<VaccinationDistributionSidebar />
          }
        ],
        
      },

    ];
    
  } else return []
};