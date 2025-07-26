import { AdminSectionCards } from "@/components/analytics/administration/admin-section-cards";
import { ProfilingSectionCards } from "@/components/analytics/profiling/profiling-section-cards";
import { ProfilingSidebar } from "@/components/analytics/profiling/profiling-sidebar";
import { ReportSectionCards } from "@/components/analytics/report/report-section-cards";
import ReportSectionCharts from "@/components/analytics/report/report-section-charts";
import { ReportSidebar } from "@/components/analytics/report/report-sidebar";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";


export default function Dashboard() {
  return (
    <MainLayoutComponent
      title="Dashboard"
      description="Overview of key metrics, data, and insights"
    >
      <div className="w-full flex gap-4">
        <div className="w-full grid gap-4">
          <div className="grid grid-cols-5">
            <AdminSectionCards/>
            <ProfilingSectionCards/>
            <ReportSectionCards/>
          </div>
          <div className="grid">
            <ReportSectionCharts/>
          </div>
        </div>
        <div className="grid gap-4">
          <ProfilingSidebar/>
          <ReportSidebar/>
        </div>
      </div>
    </MainLayoutComponent>
  );
}
