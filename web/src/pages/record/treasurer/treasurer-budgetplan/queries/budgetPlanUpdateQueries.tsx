import z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { updateBudgetPlan, updateBudgetDetails, archiveBudgetPlan, restoreBudgetPlan } from "../restful-API/budgetPlanPutAPI";
import { createBudgetPlanDetailHistory, createBudgetPlanHistory } from "../restful-API/budgetPlanPostAPI";
import { ProcessedOldBudgetDetail, BudgetHeaderUpdate, BudgetDetailUpdate } from "../budgetPlanInterfaces";

export const useUpdateBudgetPlan = (onSuccess?: (planId?: number) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: {
            newBudgetHeader: BudgetHeaderUpdate;
            oldBudgetHeader: BudgetHeaderUpdate;
            newBudgetDetails: BudgetDetailUpdate[];
            oldBudgetDetails: ProcessedOldBudgetDetail[];
        }) => {
            toast.loading("Updating Budget plan...", { id: "updateBudgetPlan" });

            try {
                // 1. First create history records
                const historyResponse = await createBudgetPlanHistory(values.oldBudgetHeader);
                const bph_id = historyResponse.data.bph_id;

                console.log('bph', bph_id)

                // Create detail histories in parallel
                await Promise.all(
                    values.oldBudgetDetails.map(detail => 
                        createBudgetPlanDetailHistory(bph_id, {
                            budget_item: detail.budget_item,
                            proposed_budget: detail.proposed_budget,
                            category: detail.category,
                            is_changed: detail.is_changed
                        })
                    )
                );

                // 2. Update current budget plan
                const headerResponse = await updateBudgetPlan(values.newBudgetHeader);
                if (!headerResponse) throw new Error("Budget header update failed");

                // 3. Update details
                if (values.newBudgetDetails?.length > 0) {
                    const detailsResponse = await updateBudgetDetails(values.newBudgetDetails);
                    if (!detailsResponse || detailsResponse.length !== values.newBudgetDetails.length) {
                        throw new Error("Some budget details failed to update");
                    }
                }

                return values.newBudgetHeader.plan_id;
            } catch (error) {
                console.error("Update error:", error);
                toast.dismiss("updateBudgetPlan");
                throw error;
            }
        },
        onSuccess: (planId) => {
            toast.success('Budget Plan updated successfully', {
                id: 'updateBudgetPlan',
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });

            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            queryClient.invalidateQueries({ queryKey: ['budgetPlanDetails'] });
            queryClient.invalidateQueries({ queryKey: ['budgetPlanHistory'] });

            onSuccess?.(planId);
            window.location.href = '/treasurer-budget-plan';
        },
        onError: (error: Error) => {
            console.error("Mutation error:", error);
            toast.error(`Failed to update budget plan: ${error.message}`, {
                id: 'updateBudgetPlan'
            });
        }
    });
};


export const useArchiveBudgetPlan = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
        mutationFn: (plan_id: number) => archiveBudgetPlan(plan_id),
        onMutate: () =>{
            toast.loading("Archiving budget plan ...", { id: "archivePlan" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] })
            toast.success('Budget Plan is archived successfully', {
                id: "archivePlan",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error archiving budget plan:", err);
            toast.error("Failed to archive budget plan", {
            id: "archivePlan",
            duration: 2000
            });
        }
    })
}

export const useRestoreBudgetPlan = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
        mutationFn: (plan_id: number) => restoreBudgetPlan(plan_id),
        onMutate: () =>{
            toast.loading("Restoring budget plan ...", { id: "restorePlan" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] })
            toast.success('Budget Plan is restored successfully', {
                id: "restorePlan",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error restoring budget plan:", err);
            toast.error("Failed to restore budget plan", {
            id: "restorePlan",
            duration: 2000
            });
        }
    })
}
