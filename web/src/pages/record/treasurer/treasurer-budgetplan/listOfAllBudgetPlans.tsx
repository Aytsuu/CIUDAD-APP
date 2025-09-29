// import { Input } from "@/components/ui/input";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Eye, Trash, ArrowUpDown, Search, Archive, ArchiveRestore } from 'lucide-react';
// import { ColumnDef } from "@tanstack/react-table";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import { Link } from "react-router-dom";
// import { useState } from "react";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { useDeleteBudgetPlan } from "./queries/budgetPlanDeleteQueries";
// import { usegetBudgetPlanActive, usegetBudgetPlanInactive, type BudgetPlanType } from "./queries/budgetplanFetchQueries";
// import { Button } from "@/components/ui/button/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { useArchiveBudgetPlan, useRestoreBudgetPlan } from "./queries/budgetPlanUpdateQueries";
// import { useNavigate } from "react-router-dom";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

// function BudgetPlan() {
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [activeTab, setActiveTab] = useState("active");
//     const [deletedPlanYear, setDeletedPlanYear] = useState<string | null>(null);
//     const currentYear = new Date().getFullYear().toString();
//     const navigate = useNavigate();

//     const { data: activePlans = [], isLoading: isLoadingInactive } = usegetBudgetPlanActive();
//     const { data: inactivePlans = [], isLoading: isLoadingInactive} = usegetBudgetPlanInactive

//     // Filter out deleted plan (for UI state only)
//     const visiblePlans = fetchedData.filter(plan => plan.plan_year !== deletedPlanYear);

//     // Filter and paginate function similar to BudgetPlanHistory
//     const filterAndPaginate = (rows: BudgetPlanType[], search: string, page: number, pageSize: number, tab: string) => {
//         const filtered = rows.filter(plan => {
//             const matchesSearch = 
//                 plan.plan_year?.toString().includes(search) ||
//                 plan.plan_issue_date?.toLowerCase().includes(search.toLowerCase());
            
//             if (tab === "active") {
//                 return matchesSearch && !plan.plan_is_archive;
//             } else {
//                 return matchesSearch && plan.plan_is_archive;
//             }
//         });
        
//         const total = filtered.length;
//         const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
//         return { filtered, paginated, total };
//     };

//     const { paginated, total } = filterAndPaginate(visiblePlans, searchTerm, currentPage, pageSize, activeTab);

//     // Check if current year plan exists (regardless of archive status)
//     const showAddButton = !(visiblePlans.some(plan => plan.plan_year === currentYear));
//     const shouldClone = showAddButton && fetchedData.length != 0;
//     const shouldNotClone = showAddButton && fetchedData.length == 0;

//     const { mutate: deletePlan } = useDeleteBudgetPlan();
//     const { mutate: archivePlan } = useArchiveBudgetPlan();
//     const { mutate: restorePlan } = useRestoreBudgetPlan();

//     const handleArchive = (plan_id: number) => {
//         archivePlan(plan_id);
//     };

//     const handleDelete = (plan_id: number, plan_year: string) => {
//         setDeletedPlanYear(plan_year);
//         deletePlan(plan_id);
//     };

//     const handleRestore = (plan_id: number) => {
//         restorePlan(plan_id);
//     };

//     if (isLoading) {
//         return (
//             <div className="w-full h-full">
//                 <Skeleton className="h-10 w-1/6 mb-3" />
//                 <Skeleton className="h-7 w-1/4 mb-6" />
//                 <Skeleton className="h-10 w-full mb-4" />
//                 <Skeleton className="h-4/5 w-full mb-4" />
//             </div>
//         );
//     }

//     // Common columns for both tabs
//     const commonColumns: ColumnDef<BudgetPlanType>[] = [
//         {
//             accessorKey: "plan_year",
//             header: ({ column }) => (
//                 <div
//                     className="flex w-full justify-center items-center gap-2 cursor-pointer"
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                 >
//                     Budget Year
//                     <ArrowUpDown size={14} />
//                 </div>
//             ),
//             cell: ({ row }) => (
//                 <div className="text-center">{row.getValue("plan_year")}</div>
//             )
//         },
//         {
//             accessorKey: "plan_issue_date",
//             header: "Issued On",
//             cell: ({ row }) => (
//                 <div className="text-center">{row.getValue("plan_issue_date")}</div>
//             )
//         },
//         {
//             accessorKey: "staff_name",
//             header: "Created By"
//         }
//     ];

//     // Columns for active tab
//     const activeColumns: ColumnDef<BudgetPlanType>[] = [
//         ...commonColumns,
//         {
//             accessorKey: "action",
//             header: "Action",
//             cell: ({ row }) => {
//                 const planId = row.original.plan_id;
//                 return (
//                     <div className="flex justify-center gap-2">
//                         <TooltipLayout
//                             trigger={
//                                 <div>
//                                     <Link to="/treasurer-budgetplan-view" state={{ type: "viewing", planId }} >
//                                         <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
//                                             <Eye size={16} />
//                                         </div>
//                                     </Link>
//                                 </div>
//                             }
//                             content="View"
//                         />
//                         <TooltipLayout
//                             trigger={
//                                 <div>
//                                     <ConfirmationModal
//                                         trigger={
//                                             <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
//                                                 <Archive size={16} />
//                                             </div>
//                                         }
//                                         title="Archive Budget Plan"
//                                         description="This budget plan will be moved to archive. You can restore it later if needed."
//                                         actionLabel="Archive"
//                                         onClick={() => handleArchive(planId!)}
//                                     />
//                                 </div>
//                             }
//                             content="Archive"
//                         />
//                     </div>
//                 );
//             }
//         }
//     ];

//     // Columns for archive tab
//     const archiveColumns: ColumnDef<BudgetPlanType>[] = [
//         ...commonColumns,
//         {
//             accessorKey: "action",
//             header: "Action",
//             cell: ({ row }) => {
//                 const planId = row.original.plan_id;
//                 const planYear = row.original.plan_year || '';
//                 return (
//                     <div className="flex justify-center gap-2">
//                         <TooltipLayout
//                             trigger={
//                                 <div>
//                                     <ConfirmationModal
//                                         trigger={
//                                             <div className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
//                                                 <ArchiveRestore size={16} />
//                                             </div>
//                                         }
//                                         title="Restore Budget Plan"
//                                         description="This will restore the budget plan and the details."
//                                         actionLabel="Restore"
//                                         onClick={() => handleRestore(planId!)}
//                                     />
//                                 </div>
//                             }
//                             content="Restore"
//                         />
//                         <TooltipLayout
//                             trigger={
//                                 <div>
//                                     <ConfirmationModal
//                                         trigger={
//                                             <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
//                                                 <Trash size={16} />
//                                             </div>
//                                         }
//                                         title="Delete Budget Plan"
//                                         description="This will permanently delete the budget plan. This action cannot be undone."
//                                         actionLabel="Delete"
//                                         onClick={() => handleDelete(planId!, planYear)}
//                                     />
//                                 </div>
//                             }
//                             content="Delete"
//                         />
//                     </div>
//                 );
//             }
//         }
//     ];

//     return (
//         <div className="w-full h-full">
//             <div className="flex flex-col gap-3 mb-4">
//                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//                     <div>Budget Plan</div>
//                 </h1>
//                 <p className="text-xs sm:text-sm text-darkGray">
//                     Efficiently oversee and allocate your budget to optimize financial planning and sustainability.
//                 </p>
//             </div>
//             <hr className="border-gray mb-7 sm:mb-9" />

//             <div className="space-y-4">
//                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <div className="relative w-full sm:w-64">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
//                         <Input
//                             placeholder="Search by year or date..."
//                             className="pl-10 bg-white"
//                             value={searchTerm}
//                             onChange={(e) => {
//                                 setSearchTerm(e.target.value);
//                                 setCurrentPage(1);
//                             }}
//                         />
//                     </div>

//                     {shouldClone ? (
//                         <ConfirmationModal
//                             trigger={<Button>+ Add New</Button>}
//                             title="Cloning Confirmation"
//                             description="Would you like to clone the data from the previous year?"
//                             actionLabel="Clone"
//                             cancelLabel="Start Fresh"
//                             showCloseButton={true}
//                             onCancel={() => {
//                                 navigate("/budgetplan-forms", { 
//                                     state: { 
//                                         shouldClone: false
//                                     } 
//                                 });
//                             }}
//                             onClick={() => {
//                                 navigate("/budgetplan-forms", { 
//                                     state: { 
//                                         shouldClone: true
//                                     } 
//                                 });
//                             }}
//                         />
//                     ): shouldNotClone ? (
//                         <Button 
//                             onClick={() => {
//                                     navigate("/budgetplan-forms", { 
//                                         state: { 
//                                             shouldClone: false
//                                         } 
//                                     });
//                                 }}
//                         >+ Add New</Button>
//                     ): null}
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <span className="text-sm">Show</span>
//                     <Select 
//                         value={pageSize.toString()} 
//                         onValueChange={(value) => {
//                             setPageSize(Number.parseInt(value));
//                             setCurrentPage(1);
//                         }}
//                     >
//                         <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
//                             <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="5">5</SelectItem>
//                             <SelectItem value="10">10</SelectItem>
//                             <SelectItem value="25">25</SelectItem>
//                             <SelectItem value="50">50</SelectItem>
//                             <SelectItem value="100">100</SelectItem>
//                         </SelectContent>
//                     </Select>
//                     <span className="text-sm">entries</span>
//                 </div>

//                 <div className="w-full bg-white border">
//                     <Tabs value={activeTab} onValueChange={setActiveTab}>
//                         <div className="ml-5 pt-4">
//                             <TabsList className="grid w-full grid-cols-2 max-w-xs">
//                                 <TabsTrigger value="active">Active Plans</TabsTrigger>
//                                 <TabsTrigger value="archive">
//                                     <div className="flex items-center gap-2">
//                                         <Archive size={16} /> Archive
//                                     </div>
//                                 </TabsTrigger>
//                             </TabsList>
//                         </div>

//                         <TabsContent value="active">
//                             <DataTable columns={activeColumns} data={paginated} />
//                         </TabsContent>

//                         <TabsContent value="archive">
//                             <DataTable columns={archiveColumns} data={paginated} />
//                         </TabsContent>
//                     </Tabs>
//                 </div>

//                 <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4">
//                     <p className="text-gray-600">
//                         Showing {(currentPage - 1) * pageSize + 1}-
//                         {Math.min(currentPage * pageSize, total)} of {total} rows
//                     </p>
//                     {total > 0 && (
//                         <PaginationLayout 
//                             currentPage={currentPage} 
//                             totalPages={Math.ceil(total / pageSize)} 
//                             onPageChange={setCurrentPage}
//                         />
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
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
  // Enable both queries to run initially or use enabled option based on activeTab
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

  // Check if current year plan exists (regardless of archive status)
  const allPlans = [...activePlans, ...inactivePlans];
  const showAddButton = !allPlans.some((plan: BudgetPlanType) => plan.plan_year === currentYear);
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
              {shouldClone ? (
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
              ) : null}
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