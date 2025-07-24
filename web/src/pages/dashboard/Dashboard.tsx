import { AdminSectionCards } from "@/components/analytics/administration/admin-section-cards";
import { ProfilingSectionCards } from "@/components/analytics/profiling/profiling-section-cards";
import { ProfilingSidebar } from "@/components/analytics/profiling/profiling-sidebar";
import { ReportSectionCards } from "@/components/analytics/report/report-section-cards";
import ReportSectionCharts from "@/components/analytics/report/report-section-charts";
import { ReportSidebar } from "@/components/analytics/report/report-sidebar";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { DonationSectionCards } from "@/components/analytics/donation/donation-cash-section-cards";
import { GADExpenseSidebar, GADIncomeSidebar } from "@/components/analytics/gad/btracker-sidebar";
import { ProjPropPendingSectionCards } from "@/components/analytics/gad/projprop-section-cards";
import { CouncilEventsSidebar } from "@/components/analytics/council/ce-event-sidebar";
import StaffAttendanceRankingChart from "@/components/analytics/council/attendance-section-charts";
import { WastePersonnelCards } from "@/components/analytics/waste/wastepersonnel-analytics-queries";
import { GADQuarterlyBudgetChart } from "@/components/analytics/gad/btracker-quarterly-report";
import { IncomeExpenseQuarterlyChart } from "@/components/analytics/treasurer/expense-quarterly-report";
import { IncomeQuarterlyChart } from "@/components/analytics/treasurer/icome-quartertly-report";
import { GargbagePickupSectionCards } from "@/components/analytics/waste/garbage-pcukup-section-cards";
import { WasteActivitySidebar } from "@/components/analytics/waste/waste-activities-sidebar";

export default function Dashboard() {
  return (
    <MainLayoutComponent
      title="Dashboard"
      description="Overview of key metrics, data, and insights"
    >
      <div className="w-full flex gap-2">
        <div className="w-full grid gap-2">
          <div className="grid grid-cols-5">
            <AdminSectionCards />
            <ProfilingSectionCards />
            <ReportSectionCards />
            <DonationSectionCards />
            <ProjPropPendingSectionCards />
            <WastePersonnelCards />
            <GargbagePickupSectionCards/>
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
        </div>
        <div className="grid gap-2">
          <ProfilingSidebar />
          <ReportSidebar />
          <GADExpenseSidebar />
          <GADIncomeSidebar />
          <CouncilEventsSidebar />
          <WasteActivitySidebar/>
        </div>
      </div>
    </MainLayoutComponent>
  );
}