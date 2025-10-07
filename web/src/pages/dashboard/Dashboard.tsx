import React from "react";
import { useAuth } from "@/context/AuthContext";
import { getItemsConfig } from "./Item";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProfilingSectionCards } from "@/components/analytics/profiling/profiling-section-cards";
import { useAdminSectionCards } from "@/components/analytics/administration/admin-section-cards";
import { useReportSectionCards } from "@/components/analytics/report/report-section-cards";
import { useHealthServicesSectionCards } from "@/components/analytics/health/services-count-cards";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  // ================ STATE INITIALIZATION ================
  const { user } = useAuth();
  const [activeChartTab, setActiveChartTab] = React.useState<string>("");
  const [currentCardPage, setCurrentCardPage] = React.useState(0);

  const profilingCards = useProfilingSectionCards();
  const adminCards = useAdminSectionCards();
  const reportCards = useReportSectionCards();
  const healthCards = useHealthServicesSectionCards();
  const instance = React.useMemo(
    () => getItemsConfig(profilingCards, adminCards, reportCards, healthCards),
    [profilingCards, adminCards, reportCards, healthCards]
  );

  const validateFeature = (feature: string) => {
    const hasAccess =
      user?.staff?.assignments?.includes(feature) ||
      user?.staff?.pos?.toLowerCase() == "admin";
    return hasAccess;
  };

  // Filter items based on user access
  const cardsWithAccess = React.useMemo(() => {
    return instance.flatMap((item) =>
      validateFeature(item.dashboard) && Array.isArray(item.card)
        ? item.card
        : []
    );
  }, [instance, user]);

  const chartsWithAccess = React.useMemo(() => {
    const itemsWithCharts = instance.filter(
      (item) => item.chart && validateFeature(item.dashboard)
    );
    return itemsWithCharts.flatMap((item) =>
      item?.chart?.map((chartItem: any) => ({
        dashboard: item.dashboard,
        ...chartItem,
      }))
    );
  }, [instance, user]);

  const sidebarsWithAccess = React.useMemo(() => {
    return instance.filter(
      (item) => item.sidebar && validateFeature(item.dashboard)
    );
  }, [instance, user]);

  // Carousel pagination
  const cardsPerPage = 6; // 3 columns × 2 rows
  const totalPages = Math.ceil(cardsWithAccess.length / cardsPerPage);

  // ================ HANDLERS ================
  const getCurrentPageCards = () => {
    const start = currentCardPage * cardsPerPage;
    const end = start + cardsPerPage;
    const pageCards = cardsWithAccess.slice(start, end);

    // Fill remaining slots with empty placeholders for size consistency
    const emptySlots = cardsPerPage - pageCards.length;
    const placeholders = Array.from({ length: emptySlots }, (_, i) => (
      <div key={`placeholder-${i}`} className="invisible">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Placeholder</p>
          <p className="text-3xl font-semibold text-gray-900">0</p>
        </div>
      </div>
    ));

    return [...pageCards, ...placeholders];
  };

  const goToNextPage = () => {
    setCurrentCardPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const goToPrevPage = () => {
    setCurrentCardPage((prev) => Math.max(0, prev - 1));
  };

  // ================ SIDE EFFECTS ================
  // Set initial active tab
  React.useEffect(() => {
    if (chartsWithAccess.length > 0 && !activeChartTab) {
      setActiveChartTab(chartsWithAccess[0].title);
    }
  }, [chartsWithAccess, activeChartTab]);

  // ================ RENDER ================
  return (
    <div className="pb-8 space-y-5">
      <div className="">
        <p className="text-darkBlue1 font-bold text-xl">Dashboard</p>
        <p className="text-gray-600 text-sm">
          Easy view of important updates and key information.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(105vh)] overflow-hidden">
        {/* Main Content with Internal Scroll */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Stats Cards Carousel */}
          <div className="flex gap-4">
            <div className="w-1/2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm p-5">
              <Label className="text-white text-xl">Upcoming Events</Label>
  
            </div>
            {cardsWithAccess.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm w-2/3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Analytics Overview
                  </h2>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Page {currentCardPage + 1} of {totalPages}
                      </span>
                      <button
                        onClick={goToPrevPage}
                        disabled={currentCardPage === 0}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={goToNextPage}
                        disabled={currentCardPage >= totalPages - 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cards Grid - 3 columns × 2 rows */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[280px]">
                  {getCurrentPageCards().map((item: any, index: number) => (
                    <React.Fragment key={`card-${currentCardPage}-${index}`}>
                      {item}
                    </React.Fragment>
                  ))}
                </div>

                {/* Page Indicators */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCardPage(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentCardPage === index
                            ? "bg-blue-600 w-6"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chart Section */}
          {chartsWithAccess.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
              {/* Chart Tabs - Fixed at top */}
              {chartsWithAccess.length > 1 && (
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                  <div className="flex gap-6 overflow-x-auto">
                    {chartsWithAccess.map((chartItem: any, index: number) => (
                      <button
                        key={`${chartItem.dashboard}-${chartItem.title}-${index}`}
                        onClick={() => setActiveChartTab(chartItem.title)}
                        className={`pb-3 px-1 text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${
                          activeChartTab === chartItem.title
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {chartItem.title}
                        {activeChartTab === chartItem.title && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chart Content */}
              <div className="flex-1 overflow-y-auto">
                {chartsWithAccess.map((chartItem: any, index: number) => (
                  <div
                    key={`${chartItem.dashboard}-chart-content-${index}`}
                    className={
                      activeChartTab === chartItem.title
                        ? "block h-full"
                        : "hidden"
                    }
                  >
                    {chartItem.element}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar with Internal Scroll */}
        {sidebarsWithAccess.length > 0 && (
          <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto flex-shrink-0 pr-1">
            {sidebarsWithAccess.map((item: any, index: number) =>
              item.sidebar.map((component: any, sidebarIndex: number) => (
                <div
                  key={`${item.dashboard}-sidebar-${index}-${sidebarIndex}`}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex-shrink-0"
                >
                  {/* Sidebar Header */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {component.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Latest updates and activity
                        </p>
                      </div>
                      {/* <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div> */}
                    </div>
                  </div>

                  {/* Sidebar Content */}
                  <div>{component.element}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// import { AdminSectionCards } from "@/components/analytics/administration/admin-section-cards";
// import { ProfilingSectionCards } from "@/components/analytics/profiling/profiling-section-cards";
// import { ProfilingSidebar } from "@/components/analytics/profiling/profiling-sidebar";
// import { ReportSectionCards } from "@/components/analytics/report/report-section-cards";
// import ReportSectionCharts from "@/components/analytics/report/report-section-charts";
// import { ReportSidebar } from "@/components/analytics/report/report-sidebar";
// import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
// import { DonationSectionCards } from "@/components/analytics/donation/donation-cash-section-cards";
// import { GADExpenseSidebar } from "@/components/analytics/gad/btracker-sidebar";
// import { CouncilEventsSidebar } from "@/components/analytics/council/ce-event-sidebar";
// import StaffAttendanceRankingChart from "@/components/analytics/council/attendance-section-charts";
// import { WastePersonnelCards } from "@/components/analytics/waste/wastepersonnel-analytics-queries";
// import { GADQuarterlyBudgetChart } from "@/components/analytics/gad/btracker-quarterly-report";
// import { IncomeExpenseQuarterlyChart } from "@/components/analytics/treasurer/expense-quarterly-report";
// import { IncomeQuarterlyChart } from "@/components/analytics/treasurer/icome-quartertly-report";
// import { GargbagePickupSectionCards } from "@/components/analytics/waste/garbage-picukup-section-cards";
// import { WasteActivitySidebar } from "@/components/analytics/waste/waste-activities-sidebar";
// import { VaccineDistributionChart } from "@/components/analytics/health/vaccine-chart";
// import { MedicineDistributionSidebar } from "@/components/analytics/health/medicine-sidebar";
// import { FirstAidDistributionSidebar } from "@/components/analytics/health/firstaid-sidebar";
// import { ServicesHealthRecordsSectionCards } from "@/components/analytics/health/services-count-cards";
// import { format } from "date-fns";
// import { MedicalHistoryMonthlyChart } from "@/components/analytics/health/illness-chart";
// // HEALTH
// import { OPTStatusChart } from "@/components/analytics/health/opt-tracking-chart";
// import { useAuth } from "@/context/AuthContext";

// export default function Dashboard() {
//   const currentMonth = format(new Date(), "yyyy-MM");
//   const { user } = useAuth()
//   console.log(user?.staff)  

//   return (
//     <MainLayoutComponent title="Dashboard" description="Overview of key metrics, data, and insights">
//       <div className="w-full flex gap-4">
//         <div className="w-full grid gap-4">
//           <div className="grid grid-cols-5">
//             <AdminSectionCards />
//             <ProfilingSectionCards />
//             <ReportSectionCards />
//             <DonationSectionCards />
//             <WastePersonnelCards />
//             <GargbagePickupSectionCards />
//             <ServicesHealthRecordsSectionCards />
//           </div>
//           <div className="grid">
//             <ReportSectionCharts />
//             <StaffAttendanceRankingChart />
//             <GADQuarterlyBudgetChart />
//           </div>
//           <div className="grid">
//             <IncomeExpenseQuarterlyChart />
//           </div>
//           <div className="grid">
//             <IncomeQuarterlyChart />
//           </div>

//           <div className="grid">
//             <OPTStatusChart initialMonth={currentMonth} />
//             <VaccineDistributionChart initialMonth={currentMonth} />
//             <MedicalHistoryMonthlyChart initialMonth={currentMonth} />

//           </div>
//         </div>
//         <div className="grid gap-2">

//           <MedicineDistributionSidebar/>
//           <FirstAidDistributionSidebar/>
//           <ProfilingSidebar />
//           <ReportSidebar />
//           <GADExpenseSidebar />
//           <CouncilEventsSidebar />
//           <WasteActivitySidebar />
//           <GADExpenseSidebar />
//           <CouncilEventsSidebar />
//         </div>
//       </div>
//     </MainLayoutComponent>
//   );
// }
