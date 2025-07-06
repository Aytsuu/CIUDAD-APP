import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { Eye, Trash, ArrowUpDown, Search, Archive, ArchiveRestore } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDeleteBudgetPlan } from "./queries/budgetPlanDeleteQueries";
import { usegetBudgetPlan, type BudgetPlanType } from "./queries/budgetplanFetchQueries";
import { Button } from "@/components/ui/button/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useArchiveBudgetPlan, useRestoreBudgetPlan } from "./queries/budgetPlanUpdateQueries";

function BudgetPlan() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("active");
    const [deletedPlanYear, setDeletedPlanYear] = useState<string | null>(null);
    const currentYear = new Date().getFullYear().toString();

    const { data: fetchedData = [], isLoading } = usegetBudgetPlan();

    // Filter out deleted plan (for UI state only)
    const visiblePlans = fetchedData.filter(plan => plan.plan_year !== deletedPlanYear);

    // Filter data based on search term and active tab
    const filteredData = useMemo(() => {
        return visiblePlans.filter(plan => {
            const matchesSearch = 
                plan.plan_year?.toString().includes(searchTerm) ||
                plan.plan_issue_date?.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (activeTab === "active") {
                return matchesSearch && !plan.plan_is_archive;
            } else {
                return matchesSearch && plan.plan_is_archive;
            }
        });
    }, [visiblePlans, searchTerm, activeTab]);

    // Pagination logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Check if current year plan exists (regardless of archive status)
    const hasCurrentYearPlan = visiblePlans.some(plan => plan.plan_year === currentYear);
    const showAddButton = !hasCurrentYearPlan;

    const { mutate: deletePlan } = useDeleteBudgetPlan();
    const { mutate: archivePlan } = useArchiveBudgetPlan();
    const { mutate: restorePlan } = useRestoreBudgetPlan();

    const handleArchive = (plan_id: number) => {
        archivePlan(plan_id);
    };

    const handleDelete = (plan_id: number, plan_year: string) => {
        setDeletedPlanYear(plan_year);
        deletePlan(plan_id);
    };

    const handleRestore = (plan_id: number) => {
        restorePlan(plan_id);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setItemsPerPage(value);
            setCurrentPage(1);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full">
                <Skeleton className="h-10 w-1/6 mb-3" />
                <Skeleton className="h-7 w-1/4 mb-6" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4/5 w-full mb-4" />
            </div>
        );
    }

    // Common columns for both tabs
    const commonColumns: ColumnDef<BudgetPlanType>[] = [
        {
            accessorKey: "plan_year",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Budget Year
                    <ArrowUpDown size={14} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("plan_year")}</div>
            )
        },
        {
            accessorKey: "plan_issue_date",
            header: "Issued On",
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("plan_issue_date")}</div>
            )
        }
    ];

    // Columns for active tab
    const activeColumns: ColumnDef<BudgetPlanType>[] = [
        ...commonColumns,
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const planId = row.original.plan_id;
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={
                                <div>
                                    <Link to="/treasurer-budgetplan-view" state={{ type: "viewing", planId }} >
                                        <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                                            <Eye size={16} />
                                        </div>
                                    </Link>
                                </div>
                            }
                            content="View"
                        />
                        <TooltipLayout
                            trigger={
                                <div>
                                    <ConfirmationModal
                                        trigger={
                                            <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                                <Archive size={16} />
                                            </div>
                                        }
                                        title="Archive Budget Plan"
                                        description="This budget plan will be moved to archive. You can restore it later if needed."
                                        actionLabel="Archive"
                                        onClick={() => handleArchive(planId!)}
                                    />
                                </div>
                            }
                            content="Archive"
                        />
                    </div>
                );
            }
        }
    ];

    // Columns for archive tab
    const archiveColumns: ColumnDef<BudgetPlanType>[] = [
        ...commonColumns,
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const planId = row.original.plan_id;
                const planYear = row.original.plan_year || '';
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={
                                <div>
                                    <ConfirmationModal
                                        trigger={
                                            <div className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
                                                <ArchiveRestore size={16} />
                                            </div>
                                        }
                                        title="Restore Budget Plan"
                                        description="This will restore the budget plan and the details."
                                        actionLabel="Restore"
                                        onClick={() => handleRestore(planId!)}
                                    />
                                </div>
                            }
                            content="Restore"
                        />
                        <TooltipLayout
                            trigger={
                                <div>
                                    <ConfirmationModal
                                        trigger={
                                            <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                                <Trash size={16} />
                                            </div>
                                        }
                                        title="Delete Budget Plan"
                                        description="This will permanently delete the budget plan. This action cannot be undone."
                                        actionLabel="Delete"
                                        onClick={() => handleDelete(planId!, planYear)}
                                    />
                                </div>
                            }
                            content="Delete"
                        />
                    </div>
                );
            }
        }
    ];

    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>San Roque Budget Plan</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Efficiently oversee and allocate your budget to optimize financial planning and sustainability.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-9" />

            <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4 md:gap-0">
                <div className="relative flex-1 max-w-[20rem]">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                        size={17}
                    />
                    <Input 
                        placeholder="Search by year or date..." 
                        className="pl-10 w-full bg-white text-sm" 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {showAddButton && (
                    <Link to="/budgetplan-forms" state={{ isEdit: false }}>
                        <Button>+ Add New</Button>
                    </Link>
                )}
            </div>

            <div className="w-full bg-white border">
                <div className="flex flex-col sm:flex-row gap-2 items-center p-4">
                    <p className="text-xs sm:text-sm">Show</p>
                    <Input 
                        type="number" 
                        className="w-14 h-8" 
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        min={1}
                    />
                    <p className="text-xs sm:text-sm">Entries</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="ml-5">
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                            <TabsTrigger value="active">Active Plans</TabsTrigger>
                            <TabsTrigger value="archive">
                                <div className="flex items-center gap-2">
                                    <Archive size={16} /> Archive
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="active">
                        <DataTable 
                            columns={activeColumns} 
                            data={paginatedData} 
                        />
                    </TabsContent>

                    <TabsContent value="archive">
                        <DataTable 
                            columns={archiveColumns} 
                            data={paginatedData} 
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
                    {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} rows
                </p>
                <div className="w-full sm:w-auto flex justify-center">
                    <PaginationLayout
                        className=""
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
}

export default BudgetPlan;