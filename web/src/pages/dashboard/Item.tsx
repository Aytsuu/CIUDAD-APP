import { useAdminSectionCards } from "@/components/analytics/administration/admin-section-cards";
import { useProfilingSectionCards } from "@/components/analytics/profiling/profiling-section-cards";
import { ProfilingSidebar } from "@/components/analytics/profiling/profiling-sidebar";
import { useReportSectionCards } from "@/components/analytics/report/report-section-cards";
import ReportSectionCharts from "@/components/analytics/report/report-section-charts";
import { ReportSidebar } from "@/components/analytics/report/report-sidebar";
import { useHealthServicesSectionCards } from "@/components/analytics/health/services-count-cards";
import { MedicineDistributionSidebar } from "@/components/analytics/health/medicine-sidebar";

// *  OBJECT PROPERTIES: dashboard, card, sidebar, chart  * //
export const getItemsConfig = (
  profilingCards: ReturnType<typeof useProfilingSectionCards>,
  administrationCards: ReturnType<typeof useAdminSectionCards>,
  reportCards: ReturnType<typeof useReportSectionCards>,
  healthCards:ReturnType<typeof useHealthServicesSectionCards>

  
  
) => {
  const { residents, families, households, businesses } = profilingCards
  const { staffs } = administrationCards
  const { incidentReports, acknowledgementReports, weeklyARs } = reportCards
  const { childHealth, firstAid, medicine, vaccinations, consultations, animalBites, familyPlanning, maternal } = healthCards
  

  return [
    {
      dashboard: "ADMINISTRATION",
      card: [ staffs ],
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
    },
    {
      dashboard: "COUNCIL",
    },
    {
      dashboard: "FINANCE",
    },
    {
      dashboard: "CERTIFICATE & CLEARANCES",
    },
    {
      dashboard: "DONATION",
    },
    {
      dashboard: "WASTE",
    },
    {
      dashboard: "MIDWIFE",
      card: [childHealth, firstAid, medicine, vaccinations, consultations, animalBites, familyPlanning, maternal],
      sidebar: [
        {
          title: "Most Requested Medicine",
          element: <MedicineDistributionSidebar />,
        },
      ],
    }
  ];
};