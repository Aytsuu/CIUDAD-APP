import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Archive, Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { usegetBudgetPlanInactive, type BudgetPlanType } from "./queries/budgetplanFetchQueries";
import { useBudgetPlanColumns } from "./budgetplanColumns";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";


export default function InactiveBudgetPlan({ deletedPlanYear,  }: {
    deletedPlanYear: string | null;  
}) {
  const { budgetPlanArchiveColumns } = useBudgetPlanColumns();
  const { showLoading, hideLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: inactivePlansData, isLoading: isLoadingInactive,} = usegetBudgetPlanInactive(currentPage, pageSize, debouncedSearchQuery);

  const inactivePlans = inactivePlansData?.results || [];
  const inactiveTotalCount = inactivePlansData?.count || 0;
  const totalPages = Math.ceil(inactiveTotalCount / pageSize);

   // ----------------- LOADING MGMT --------------------
    useEffect(() => {
        if (isLoadingInactive) {
        showLoading()
        } else {
        hideLoading()
        }
    }, [isLoadingInactive, showLoading, hideLoading])

  const visiblePlans = inactivePlans.filter(
    (plan: BudgetPlanType) => plan.plan_year !== deletedPlanYear
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, pageSize]);

  if (isLoadingInactive) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" />
        <span className="ml-2 text-gray-600">Loading archived budget plans...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Search + Show entries */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search archived plans..."
            className="pl-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Show</span>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
            <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
      </div>

      {/* Content */}
      {inactivePlans.length === 0 ? (
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
        <>
          {/* Table */}
          <DataTable columns={budgetPlanArchiveColumns} data={visiblePlans} />

          {/* Pagination */}
          {inactivePlans.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                Showing{" "}
                <span className="font-medium">
                  {inactiveTotalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </span>{" "}
                -{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, inactiveTotalCount)}
                </span>{" "}
                of <span className="font-medium">{inactiveTotalCount}</span> archived budget plans
              </p>

              {totalPages > 0 && (
                <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}