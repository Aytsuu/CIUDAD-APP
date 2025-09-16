import { AdminSectionCards } from "@/components/analytics/administration/admin-section-cards";
import { ProfilingSectionCards } from "@/components/analytics/profiling/profiling-section-cards";
import { ProfilingSidebar } from "@/components/analytics/profiling/profiling-sidebar";
import { ReportSectionCards } from "@/components/analytics/report/report-section-cards";
import ReportSectionCharts from "@/components/analytics/report/report-section-charts";
import { ReportSidebar } from "@/components/analytics/report/report-sidebar";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { DonationSectionCards } from "@/components/analytics/donation/donation-cash-section-cards";
import { GADExpenseSidebar } from "@/components/analytics/gad/btracker-sidebar";
import { ProjPropPendingSectionCards } from "@/components/analytics/gad/projprop-section-cards";
import { CouncilEventsSidebar } from "@/components/analytics/council/ce-event-sidebar";
import StaffAttendanceRankingChart from "@/components/analytics/council/attendance-section-charts";
import { WastePersonnelCards } from "@/components/analytics/waste/wastepersonnel-analytics-queries";
import { GADQuarterlyBudgetChart } from "@/components/analytics/gad/btracker-quarterly-report";
import { IncomeExpenseQuarterlyChart } from "@/components/analytics/treasurer/expense-quarterly-report";
import { IncomeQuarterlyChart } from "@/components/analytics/treasurer/icome-quartertly-report";
import { GargbagePickupSectionCards } from "@/components/analytics/waste/garbage-picukup-section-cards";
import { WasteActivitySidebar } from "@/components/analytics/waste/waste-activities-sidebar";
import { VaccineDistributionChart } from "@/components/analytics/health/vaccine-chart";
import { MedicineDistributionSidebar } from "@/components/analytics/health/medicine-sidebar";
import { FirstAidDistributionSidebar } from "@/components/analytics/health/firstaid-sidebar";
import { ServicesHealthRecordsSectionCards } from "@/components/analytics/health/services-count-cards";
import { format } from "date-fns";

// HEALTH
import { OPTStatusChart } from "@/components/analytics/health/opt-tracking-chart";

export default function Dashboard() {
  const currentMonth = format(new Date(), "yyyy-MM")

  return (
    <MainLayoutComponent
      title="Dashboard"
      description="Overview of key metrics, data, and insights"
    >
      <div className="w-full flex gap-4">
        <div className="w-full grid gap-4">
          <div className="grid grid-cols-5">
            <AdminSectionCards />
            <ProfilingSectionCards />
            <ReportSectionCards />
            <DonationSectionCards />
            <ProjPropPendingSectionCards />
            <WastePersonnelCards />
            <GargbagePickupSectionCards />
            <ServicesHealthRecordsSectionCards />


          </div>
          <div className="grid">
            <ReportSectionCharts />
            <StaffAttendanceRankingChart />
            <GADQuarterlyBudgetChart />
           
          </div>
          <div className="grid">
            <IncomeExpenseQuarterlyChart />
          </div>
          <div className="grid">
            <IncomeQuarterlyChart />
          </div>

          <div className="grid">
            <OPTStatusChart initialMonth={currentMonth} />
            <VaccineDistributionChart initialMonth={currentMonth} />
          </div>
        </div>
        <div className="grid gap-2">
          <ProfilingSidebar />
          <ReportSidebar />
          <GADExpenseSidebar />
          <CouncilEventsSidebar />
          <WasteActivitySidebar/>
          <GADExpenseSidebar/>
          <CouncilEventsSidebar/>
        </div>
      </div>
    </MainLayoutComponent>
  );
}
