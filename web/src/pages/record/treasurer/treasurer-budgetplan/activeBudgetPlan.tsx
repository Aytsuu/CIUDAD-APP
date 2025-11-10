import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Archive, Search, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { usegetBudgetPlanActive, type BudgetPlanType } from "./queries/budgetplanFetchQueries";
import { useBudgetPlanColumns } from "./budgetplanColumns";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useNavigate } from "react-router-dom";
import { useLoading } from "@/context/LoadingContext";


export default function ActiveBudgetPlan({ deletedPlanYear, showAddButton }: {
deletedPlanYear: string | null;
showAddButton: boolean;
}) {
    const navigate = useNavigate();
    const { budgetPlanActiveColumns } = useBudgetPlanColumns();

    // Local states (independent of parent)
    const { showLoading, hideLoading } = useLoading();
    const [searchQuery, setSearchQuery] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const {
        data: activePlansData,
        isLoading: isLoadingActive,
    } = usegetBudgetPlanActive(currentPage, pageSize, debouncedSearchQuery);

    const activePlans = activePlansData?.results || [];
    const activeTotalCount = activePlansData?.count || 0;
    const totalPages = Math.ceil(activeTotalCount / pageSize);

    // Check if we should show clone options
    const shouldClone = showAddButton && activePlans.length > 0;

    // ----------------- LOADING MGMT --------------------
    useEffect(() => {
        if (isLoadingActive) {
            showLoading()
        } else {
            hideLoading()
        }
    }, [isLoadingActive, showLoading, hideLoading])

    // Filter out deleted plan (UI only)
    const visiblePlans = activePlans.filter(
        (plan: BudgetPlanType) => plan.plan_year !== deletedPlanYear
    );

    useEffect(() => {
        setCurrentPage(1); // reset page when search changes
    }, [debouncedSearchQuery, pageSize]);

    if (isLoadingActive) {
        return (
        <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
            <span className="ml-2 text-gray-600">Loading active budget plans...</span>
        </div>
        );
    }

    return (
        <div>
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6">
            {/* Top Row: Search + Add Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                placeholder="Search active plans..."
                className="pl-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Add Button */}
            {showAddButton && (
                shouldClone ? (
                <ConfirmationModal
                    trigger={
                    <Button className="flex items-center gap-2 w-full sm:w-auto">
                        <Plus size={16} />
                        Add New
                    </Button>
                    }
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
                ) : (
                <Button 
                    className="flex items-center gap-2 w-full sm:w-auto"
                    onClick={() => {
                    navigate("/budgetplan-forms", { 
                        state: { 
                        shouldClone: false
                        } 
                    });
                    }}
                >
                    <Plus size={16} />
                    Add New
                </Button>
                )
            )}
            </div>

            {/* Show entries - Below Search Bar */}
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
        {activePlans.length === 0 ? (
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
            <>
            {/* Table */}
            <DataTable columns={budgetPlanActiveColumns} data={visiblePlans} />

            {/* Pagination */}
            {activePlans.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                    Showing{" "}
                    <span className="font-medium">
                    {activeTotalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium">
                    {Math.min(currentPage * pageSize, activeTotalCount)}
                    </span>{" "}
                    of <span className="font-medium">{activeTotalCount}</span> active budget plans
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