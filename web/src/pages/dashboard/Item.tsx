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
import { MaternalAgeDistributionChart } from "@/components/analytics/health/maternal-age-chart";
import { VaccinationDistributionSidebar } from "@/components/analytics/health/vaccination-sidebar";
import { PendingMedicalAppointmentsSidebar } from "@/components/analytics/health/pending-medapp-sidebar";
import { PendingMedicineRequestsSidebar } from "@/components/analytics/health/pending-medreq-sidebar";
import { AnimalBiteAnalyticsCharts } from "@/components/analytics/animalbites/animal-bite-analytics-charts";
import { AnimalBiteSectionCards } from "@/components/analytics/animalbites/animal-bite-section-cards";
import { PendingPrenatalAppSidebar } from "@/components/analytics/health/pending-prenatalapp-sidebar";

import { SchedulerSidebar } from "@/components/analytics/health/scheduler-sidebar";

// *  OBJECT PROPERTIES: dashboard, card, sidebar, chart  * //
export const getItemsConfig = (
  profilingCards: ReturnType<typeof useProfilingSectionCards>,
  administrationCards: ReturnType<typeof useAdminSectionCards>,
  reportCards: ReturnType<typeof useReportSectionCards>,
  healthCards: ReturnType<typeof useHealthServicesSectionCards>
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
        dashboard: "ANIMAL BITES ",
        card: [
          <AnimalBiteSectionCards key="animal-bite-cards" initialMonth={currentMonth} />,
        ],
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
        {
          title: "Animal Bites",
          element: <AnimalBiteAnalyticsCharts initialMonth={currentMonth} />,
        },
        ],
        sidebar:[
          {
            title: "Pending Medical Appointments",
            element: <PendingMedicalAppointmentsSidebar />,
          },
          {
            title: "Pending Prenatal Appointments",
            element: <PendingPrenatalAppSidebar />,
          },
          {
            title: "Pending Medicine Requests",
            element: <PendingMedicineRequestsSidebar />,
          },
        ]
      },

      {
        dashboard: "INVENTORY",
        sidebar: [
          {
            title: "Weekly Schedule",
            element: <SchedulerSidebar />,
          },
          {
            title: "Medicine",
            element: <MedicineDistributionSidebar />,
          },
          {
            title: "First Aid",
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