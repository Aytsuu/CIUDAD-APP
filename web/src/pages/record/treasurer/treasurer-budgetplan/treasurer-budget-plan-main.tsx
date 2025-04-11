import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { Eye, Trash, ArrowUpDown, Search, CircleCheck } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Link } from "react-router-dom";
import { useState } from "react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import CreateBudgetPlanHeader from "./CreateBudgetPlanForms/treasurer_budgetplan_header_form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteBudgetPlan } from "./restful-API/budgetPlanDeleteAPI";
import { getBudgetPlan } from "./restful-API/budgetplanGetAPI";
import { Skeleton } from "@mui/material";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toast } from "sonner";

export type BudgetPlan = {
    plan_id: number,
    plan_year: string,
    plan_issue_date: string,
}

function BudgetPlan() {
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const totalPages = 10;

    
    const { data: budgetPlans, isLoading: isLoadingBudgetPlan } = useQuery<BudgetPlan[]>({
        queryKey: ['plan'],
        queryFn: getBudgetPlan,
        refetchOnMount: true,
        staleTime: 0
    });

    // loading screen
    if (isLoadingBudgetPlan) {
        return (
            <div className="w-full h-full">
                <Skeleton className="h-10 w-1/6 mb-3" />
                <Skeleton className="h-7 w-1/4 mb-6" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4/5 w-full mb-4" />
            </div>
        );
    }

    // delete budgetplan function
    const handleDelete = async (planId: number) => {
        try {
            const toastId = toast.loading("Deleting budget plan...");
            const success = await deleteBudgetPlan(planId);
            
            if (success) {
                toast.success("Budget Plan deleted successfully", {
                    id: toastId,
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
                });
                queryClient.invalidateQueries({queryKey: ['plan']});
            } else {
                toast.error("Failed to delete budget plan", { id: toastId });
            }
        } catch (error) {
            toast.error("An error occurred while deleting the budget plan");
            console.error("Delete error:", error);
        }
    };

    // Table Columns
    const columns: ColumnDef<BudgetPlan>[] = [
        { 
            accessorKey: "plan_year",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Budget Year
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="text-center">{row.getValue("plan_year")}</div>
            )
        },
        { 
            accessorKey: "plan_issue_date", 
            header: "Issued On",
            cell: ({row}) => (
                <div className="text-center">{row.getValue("plan_issue_date")}</div>
            )
        },
        {
            accessorKey: "action", 
            header: "Action",
            cell: ({ row }) => {
                const planId = row.original.plan_id;
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={
                                <Link to={`/treasurer-budgetplan-view/${planId}`}>
                                    <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                                        <Eye size={16} />
                                    </div>
                                </Link>
                            }
                            content="View"
                        />
                        <ConfirmationModal
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer" > <Trash size={16} /></div>}
                            title="Confirm Delete"
                            description="Are you sure you want to delete this budget plan?"
                            actionLabel="Confirm"
                            onClick={() => handleDelete(planId)}
                        />
                    </div>
                );
            }
        }
    ];


    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };


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
                    <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> 
                </div>
                
                <DialogLayout
                    trigger={<div className="bg-buttonBlue text-white text-[14px] font-semibold cursor-pointer rounded-md p-3">+ Add New</div>}
                    className=""
                    title="Create Budget Plan Header"
                    description="Fill out the form to create a new budget plan header."
                    mainContent={
                        <CreateBudgetPlanHeader/>
                    }
                />
            </div>

            <div className="w-full bg-white border border-none"> 
                <div className="flex flex-col sm:flex-row gap-2 items-center p-4">
                    <p className="text-xs sm:text-sm">Show</p>
                    <Input type="number" className="w-14 h-8" defaultValue="10" />
                    <p className="text-xs sm:text-sm">Entries</p>
                </div>                              

                <DataTable columns={columns} data={budgetPlans || []} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing 1-10 of 150 rows
                </p>
                <div className="w-full sm:w-auto flex justify-center">
                    <PaginationLayout className="" totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange}/>                
                </div>
            </div>  
        </div>
    );
}

export default BudgetPlan;