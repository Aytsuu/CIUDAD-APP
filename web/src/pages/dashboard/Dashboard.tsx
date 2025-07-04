import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { DonationSectionCards } from "@/components/analytics/donation/donation-cash-section-cards";
import { GADExpenseSidebar, GADIncomeSidebar } from "@/components/analytics/gad/btracker-sidebar";
import { ProjPropPendingSectionCards } from "@/components/analytics/gad/projprop-section-cards";
import { CouncilEventsSidebar } from "@/components/analytics/council/ce-event-sidebar";
import StaffAttendanceRankingChart from "@/components/analytics/council/attendance-section-charts";

export default function Dashboard() {
  return (
    <MainLayoutComponent
      title="Dashboard"
      description="Overview of key metrics, data, and insights"
    >
      <div className="w-full flex gap-2">
        <div className="w-full grid gap-2">
          <div className="grid grid-cols-5">
            {/* <DonationSectionCards/>
            <ProjPropPendingSectionCards/> */}
          </div>
          <div className="grid">
            {/* <StaffAttendanceRankingChart/> */}
          </div>
        </div>
        <div className="grid gap-2">
          {/* <GADExpenseSidebar/>
          <GADIncomeSidebar/> */}
          {/* <CouncilEventsSidebar/> */}
        </div>
      </div>
    </MainLayoutComponent>
  );
}