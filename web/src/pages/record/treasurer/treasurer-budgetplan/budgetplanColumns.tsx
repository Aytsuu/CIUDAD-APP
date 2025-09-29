import { ColumnDef } from "@tanstack/react-table";
import type { BudgetPlan } from "./budgetPlanInterfaces";
import { ArrowUpDown, ArchiveRestore, Eye, Trash, Archive } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Link } from "react-router";
import { useDeleteBudgetPlan } from "./queries/budgetPlanDeleteQueries";
import { useArchiveBudgetPlan, useRestoreBudgetPlan } from "./queries/budgetPlanUpdateQueries";
import { useState } from "react";

export const useBudgetPlanColumns = () => {
  const { mutate: deletePlan } = useDeleteBudgetPlan();
  const { mutate: archivePlan } = useArchiveBudgetPlan();
  const { mutate: restorePlan } = useRestoreBudgetPlan();
  const [deletedPlanYear, setDeletedPlanYear] = useState<string | null>(null);

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

  const budgetPlanCommonColumns: ColumnDef<BudgetPlan>[] = [
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
    },
    {
      accessorKey: "staff_name",
      header: "Created By"
    }
  ];

  const budgetPlanActiveColumns: ColumnDef<BudgetPlan>[] = [
    ...budgetPlanCommonColumns,
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

  const budgetPlanArchiveColumns: ColumnDef<BudgetPlan>[] = [
    ...budgetPlanCommonColumns,
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

  return {
    budgetPlanActiveColumns,
    budgetPlanArchiveColumns,
    deletedPlanYear,
    setDeletedPlanYear
  };
};