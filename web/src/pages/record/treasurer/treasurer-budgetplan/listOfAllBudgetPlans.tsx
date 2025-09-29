// import { Input } from "@/components/ui/input";
// import { DataTable } from "@/components/ui/table/data-table";
// import { useState, useEffect } from "react";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { usegetBudgetPlanActive, usegetBudgetPlanInactive, type BudgetPlanType } from "./queries/budgetplanFetchQueries";
// import { Button } from "@/components/ui/button/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { useNavigate } from "react-router-dom";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
// import { useDebounce } from "@/hooks/use-debounce";
// import { useLoading } from "@/context/LoadingContext";
// import { Card } from "@/components/ui/card";
// import { Spinner } from "@/components/ui/spinner";
// import { useBudgetPlanColumns } from "./budgetplanColumns";
// import { Search, Archive } from "lucide-react";

// function BudgetPlan() {
//   const navigate = useNavigate();
//   const { showLoading, hideLoading } = useLoading();
  
//   // ----------------- STATE INITIALIZATION --------------------
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [pageSize, setPageSize] = useState<number>(10);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [activeTab, setActiveTab] = useState("active");
  
//   // Use the custom hook for columns
//   const { budgetPlanActiveColumns, budgetPlanArchiveColumns, deletedPlanYear, setDeletedPlanYear } = useBudgetPlanColumns();
  
//   const debouncedSearchQuery = useDebounce(searchQuery, 300);
//   const debouncedPageSize = useDebounce(pageSize, 100);
//   const currentYear = new Date().getFullYear().toString();

//   // ----------------- DATA FETCHING --------------------
//   // Enable both queries to run initially or use enabled option based on activeTab
//   const { 
//     data: activePlansData, 
//     isLoading: isLoadingActive,
//     refetch: refetchActive 
//   } = usegetBudgetPlanActive(currentPage, debouncedPageSize, debouncedSearchQuery);

//   const { 
//     data: inactivePlansData, 
//     isLoading: isLoadingInactive,
//     refetch: refetchInactive 
//   } = usegetBudgetPlanInactive(currentPage, debouncedPageSize, debouncedSearchQuery)

//   console.log('Active', activePlansData)
//   console.log('Archive', inactivePlansData)

//   const activePlans = activePlansData?.results || [];
//   const inactivePlans = inactivePlansData?.results || [];
//   const activeTotalCount = activePlansData?.count || 0;
//   const inactiveTotalCount = inactivePlansData?.count || 0;

//   // Get data for current tab
//   const currentData = activeTab === "active" ? activePlansData : inactivePlansData;
//   const currentPlans = activeTab === "active" ? activePlans : inactivePlans;
//   const currentTotalCount = activeTab === "active" ? activeTotalCount : inactiveTotalCount;
//   const currentIsLoading = activeTab === "active" ? isLoadingActive : isLoadingInactive;

//   const planList = currentData?.results || [];
//   const totalPages = Math.ceil(currentTotalCount / pageSize);

//   // Filter out deleted plan (for UI state only)
//   const visiblePlans = planList.filter((plan: BudgetPlanType) => plan.plan_year !== deletedPlanYear);

//   // Check if current year plan exists (regardless of archive status)
//   const allPlans = [...activePlans, ...inactivePlans];
//   const showAddButton = !allPlans.some((plan: BudgetPlanType) => plan.plan_year === currentYear);
//   const shouldClone = showAddButton && allPlans.length !== 0;
//   const shouldNotClone = showAddButton && allPlans.length === 0;

//   // Refetch data when tab changes
//   useEffect(() => {
//     if (activeTab === "active") {
//       refetchActive();
//     } else {
//       refetchInactive();
//     }
//   }, [activeTab, refetchActive, refetchInactive]);

//   // Reset to page 1 when search query changes or tab changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [debouncedSearchQuery, activeTab]);

//   // ----------------- LOADING MANAGEMENT --------------------
//   useEffect(() => {
//     if (isLoadingActive || isLoadingInactive) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [isLoadingActive, isLoadingInactive, showLoading, hideLoading]);

//   // ----------------- LOADING STATE --------------------
//   if ((isLoadingActive && activeTab === "active") || (isLoadingInactive && activeTab === "archive")) {
//     return (
//       <div className="w-full h-full">
//         <Skeleton className="h-10 w-1/6 mb-3" />
//         <Skeleton className="h-7 w-1/4 mb-6" />
//         <Skeleton className="h-10 w-full mb-4" />
//         <Skeleton className="h-4/5 w-full mb-4" />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full">
//       <div className="flex flex-col gap-3 mb-4">
//         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//           <div>Budget Plan</div>
//         </h1>
//         <p className="text-xs sm:text-sm text-darkGray">
//           Efficiently oversee and allocate your budget to optimize financial planning and sustainability.
//         </p>
//       </div>
//       <hr className="border-gray mb-7 sm:mb-9" />

//       <Card className="w-full">
//         {/* Search and Actions Bar */}
//         <div className="bg-white rounded-xl p-6">
//           <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <Input
//                 placeholder="Search by year, date, or staff name..."
//                 className="pl-11"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-wrap gap-3">
//               {shouldClone ? (
//                 <ConfirmationModal
//                   trigger={<Button>+ Add New</Button>}
//                   title="Cloning Confirmation"
//                   description="Would you like to clone the data from the previous year?"
//                   actionLabel="Clone"
//                   cancelLabel="Start Fresh"
//                   showCloseButton={true}
//                   onCancel={() => {
//                     navigate("/budgetplan-forms", { 
//                       state: { 
//                         shouldClone: false
//                       } 
//                     });
//                   }}
//                   onClick={() => {
//                     navigate("/budgetplan-forms", { 
//                       state: { 
//                         shouldClone: true
//                       } 
//                     });
//                   }}
//                 />
//               ) : shouldNotClone ? (
//                 <Button 
//                   onClick={() => {
//                     navigate("/budgetplan-forms", { 
//                       state: { 
//                         shouldClone: false
//                       } 
//                     });
//                   }}
//                 >
//                   + Add New
//                 </Button>
//               ) : null}
//             </div>
//           </div>
//         </div>

//         <div className="px-6 py-4">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <span className="text-sm font-medium text-gray-700">Show</span>
//               <Select 
//                 value={pageSize.toString()} 
//                 onValueChange={(value) => setPageSize(Number.parseInt(value))}
//               >
//                 <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="5">5</SelectItem>
//                   <SelectItem value="10">10</SelectItem>
//                   <SelectItem value="25">25</SelectItem>
//                   <SelectItem value="50">50</SelectItem>
//                   <SelectItem value="100">100</SelectItem>
//                 </SelectContent>
//               </Select>
//               <span className="text-sm text-gray-600">entries</span>
//             </div>
//           </div>
//         </div>

//         {/* Tabs and Data Table - Always show regardless of data */}
//         <div className="w-full bg-white border">
//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <div className="ml-5 pt-4">
//               <TabsList className="grid w-full grid-cols-2 max-w-xs">
//                 <TabsTrigger value="active">
//                   Active Plans {activeTotalCount > 0 && `(${activeTotalCount})`}
//                 </TabsTrigger>
//                 <TabsTrigger value="archive">
//                   <div className="flex items-center gap-2">
//                     <Archive size={16} /> 
//                     Archive {inactiveTotalCount > 0 && `(${inactiveTotalCount})`}
//                   </div>
//                 </TabsTrigger>
//               </TabsList>
//             </div>

//             {/* Active Plans Tab - Always show */}
//             <TabsContent value="active">
//               {isLoadingActive ? (
//                 <div className="flex items-center justify-center py-12">
//                   <Spinner size="lg" />
//                   <span className="ml-2 text-gray-600">Loading active budget plans...</span>
//                 </div>
//               ) : activePlans.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">
//                     {searchQuery ? "No active budget plans found" : "No active budget plans yet"}
//                   </h3>
//                   <p className="text-gray-500 mb-4">
//                     {searchQuery
//                       ? `No active budget plans match "${searchQuery}". Try adjusting your search.`
//                       : "Active budget plans will appear here once created."}
//                   </p>
//                 </div>
//               ) : (
//                 <DataTable columns={budgetPlanActiveColumns} data={visiblePlans} />
//               )}
//             </TabsContent>

//             {/* Archive Plans Tab - Always show */}
//             <TabsContent value="archive">
//               {isLoadingInactive ? (
//                 <div className="flex items-center justify-center py-12">
//                   <Spinner size="lg" />
//                   <span className="ml-2 text-gray-600">Loading archived budget plans...</span>
//                 </div>
//               ) : inactivePlans.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">
//                     {searchQuery ? "No archived budget plans found" : "No archived budget plans yet"}
//                   </h3>
//                   <p className="text-gray-500 mb-4">
//                     {searchQuery
//                       ? `No archived budget plans match "${searchQuery}". Try adjusting your search.`
//                       : "Archived budget plans will appear here once you archive them."}
//                   </p>
//                 </div>
//               ) : (
//                 <DataTable columns={budgetPlanArchiveColumns} data={visiblePlans} />
//               )}
//             </TabsContent>
//           </Tabs>
//         </div>

//         {/* Pagination - Show only when there's data in current tab */}
//         {!currentIsLoading && currentPlans.length > 0 && (
//           <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
//             <p className="text-sm text-gray-600 mb-2 sm:mb-0">
//               Showing <span className="font-medium">{currentTotalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> -{" "}
//               <span className="font-medium">{Math.min(currentPage * pageSize, currentTotalCount)}</span> of{" "}
//               <span className="font-medium">{currentTotalCount}</span> {activeTab === "active" ? "active" : "archived"} budget plans
//             </p>

//             {totalPages > 0 && (
//               <PaginationLayout 
//                 currentPage={currentPage} 
//                 totalPages={totalPages} 
//                 onPageChange={setCurrentPage} 
//               />
//             )}
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }

// export default BudgetPlan;

import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { useState, useEffect } from "react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { usegetBudgetPlanActive, usegetBudgetPlanInactive, type BudgetPlanType } from "./queries/budgetplanFetchQueries";
import { Button } from "@/components/ui/button/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/context/LoadingContext";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useBudgetPlanColumns } from "./budgetplanColumns";
import { Search, Archive } from "lucide-react";

function BudgetPlan() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  
  // ----------------- STATE INITIALIZATION --------------------
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("active");
  
  // Use the custom hook for columns
  const { budgetPlanActiveColumns, budgetPlanArchiveColumns, deletedPlanYear, setDeletedPlanYear } = useBudgetPlanColumns();
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);
  const currentYear = new Date().getFullYear().toString();

  // ----------------- DATA FETCHING --------------------
  const { 
    data: activePlansData, 
    isLoading: isLoadingActive,
    refetch: refetchActive 
  } = usegetBudgetPlanActive(currentPage, debouncedPageSize, debouncedSearchQuery);

  const { 
    data: inactivePlansData, 
    isLoading: isLoadingInactive,
    refetch: refetchInactive 
  } = usegetBudgetPlanInactive(currentPage, debouncedPageSize, debouncedSearchQuery)

  console.log('Active', activePlansData)
  console.log('Archive', inactivePlansData)

  const activePlans = activePlansData?.results || [];
  const inactivePlans = inactivePlansData?.results || [];
  const activeTotalCount = activePlansData?.count || 0;
  const inactiveTotalCount = inactivePlansData?.count || 0;

  // Get data for current tab
  const currentData = activeTab === "active" ? activePlansData : inactivePlansData;
  const currentPlans = activeTab === "active" ? activePlans : inactivePlans;
  const currentTotalCount = activeTab === "active" ? activeTotalCount : inactiveTotalCount;
  const currentIsLoading = activeTab === "active" ? isLoadingActive : isLoadingInactive;

  const planList = currentData?.results || [];
  const totalPages = Math.ceil(currentTotalCount / pageSize);

  // Filter out deleted plan (for UI state only)
  const visiblePlans = planList.filter((plan: BudgetPlanType) => plan.plan_year !== deletedPlanYear);

  // Check if current year plan exists (regardless of archive status or deletion)
  // Use the original data before filtering for the current year check
  const allActivePlans = activePlansData?.results || [];
  const allInactivePlans = inactivePlansData?.results || [];
  const allPlans = [...allActivePlans, ...allInactivePlans];
  
  // Check if there's any plan (active, inactive, or recently deleted) with current year
  const currentYearPlanExists = allPlans.some((plan: BudgetPlanType) => plan.plan_year === currentYear);
  
  // Also check if the deleted plan year is the current year
  const isCurrentYearDeleted = deletedPlanYear === currentYear;
  
  // Show add button if no current year plan exists OR if the current year plan was just deleted
  const showAddButton = !currentYearPlanExists || isCurrentYearDeleted;
  
  const shouldClone = showAddButton && allPlans.length !== 0;
  const shouldNotClone = showAddButton && allPlans.length === 0;

  // Refetch data when tab changes
  useEffect(() => {
    if (activeTab === "active") {
      refetchActive();
    } else {
      refetchInactive();
    }
  }, [activeTab, refetchActive, refetchInactive]);

  // Reset to page 1 when search query changes or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, activeTab]);

  // Clear deletedPlanYear after some time to avoid permanent filtering
  useEffect(() => {
    if (deletedPlanYear) {
      const timer = setTimeout(() => {
        setDeletedPlanYear(null);
      }, 5000); // Clear after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [deletedPlanYear]);

  // ----------------- LOADING MANAGEMENT --------------------
  useEffect(() => {
    if (isLoadingActive || isLoadingInactive) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingActive, isLoadingInactive, showLoading, hideLoading]);

  // ----------------- LOADING STATE --------------------
  if ((isLoadingActive && activeTab === "active") || (isLoadingInactive && activeTab === "archive")) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-3 mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
          <div>Budget Plan</div>
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Efficiently oversee and allocate your budget to optimize financial planning and sustainability.
        </p>
      </div>
      <hr className="border-gray mb-7 sm:mb-9" />

      <Card className="w-full">
        {/* Search and Actions Bar */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by year, date, or staff name..."
                className="pl-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {showAddButton && (
                shouldClone ? (
                  <ConfirmationModal
                    trigger={<Button>+ Add New</Button>}
                    title="Cloning Confirmation"
                    description="Would you like to clone the data from the previous year?"
                    actionLabel="Clone"
                    cancelLabel="Start Fresh"
                    showCloseButton={true}
                    onCancel={() => {
                      navigate("/budgetplan-forms", { 
                        state: { 
                          shouldClone: false
                        } 
                      });
                    }}
                    onClick={() => {
                      navigate("/budgetplan-forms", { 
                        state: { 
                          shouldClone: true
                        } 
                      });
                    }}
                  />
                ) : shouldNotClone ? (
                  <Button 
                    onClick={() => {
                      navigate("/budgetplan-forms", { 
                        state: { 
                          shouldClone: false
                        } 
                      });
                    }}
                  >
                    + Add New
                  </Button>
                ) : null
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Show</span>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(value) => setPageSize(Number.parseInt(value))}
              >
                <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
          </div>
        </div>

        {/* Tabs and Data Table - Always show regardless of data */}
        <div className="w-full bg-white border">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="ml-5 pt-4">
              <TabsList className="grid w-full grid-cols-2 max-w-xs">
                <TabsTrigger value="active">
                  Active Plans {activeTotalCount > 0 && `(${activeTotalCount})`}
                </TabsTrigger>
                <TabsTrigger value="archive">
                  <div className="flex items-center gap-2">
                    <Archive size={16} /> 
                    Archive {inactiveTotalCount > 0 && `(${inactiveTotalCount})`}
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Active Plans Tab - Always show */}
            <TabsContent value="active">
              {isLoadingActive ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                  <span className="ml-2 text-gray-600">Loading active budget plans...</span>
                </div>
              ) : activePlans.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? "No active budget plans found" : "No active budget plans yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery
                      ? `No active budget plans match "${searchQuery}". Try adjusting your search.`
                      : "Active budget plans will appear here once created."}
                  </p>
                </div>
              ) : (
                <DataTable columns={budgetPlanActiveColumns} data={visiblePlans} />
              )}
            </TabsContent>

            {/* Archive Plans Tab - Always show */}
            <TabsContent value="archive">
              {isLoadingInactive ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                  <span className="ml-2 text-gray-600">Loading archived budget plans...</span>
                </div>
              ) : inactivePlans.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? "No archived budget plans found" : "No archived budget plans yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery
                      ? `No archived budget plans match "${searchQuery}". Try adjusting your search.`
                      : "Archived budget plans will appear here once you archive them."}
                  </p>
                </div>
              ) : (
                <DataTable columns={budgetPlanArchiveColumns} data={visiblePlans} />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Pagination - Show only when there's data in current tab */}
        {!currentIsLoading && currentPlans.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing <span className="font-medium">{currentTotalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> -{" "}
              <span className="font-medium">{Math.min(currentPage * pageSize, currentTotalCount)}</span> of{" "}
              <span className="font-medium">{currentTotalCount}</span> {activeTab === "active" ? "active" : "archived"} budget plans
            </p>

            {totalPages > 0 && (
              <PaginationLayout 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default BudgetPlan;