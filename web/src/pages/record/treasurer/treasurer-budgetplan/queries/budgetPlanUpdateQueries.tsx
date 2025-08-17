import {z} from "zod"
import { BudgetPlanStep1Schema } from "@/form-schema/treasurer/budgetplan-schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateBudgetHeader, restoreBudgetPlan, archiveBudgetPlan, updateBudgetItem } from "../restful-API/budgetPlanPutAPI";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useUpdateBudgetHeader = (onSuccess: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: z.infer<typeof BudgetPlanStep1Schema>) => 
        updateBudgetHeader(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            queryClient.invalidateQueries({ queryKey: ['budgetDetails'] });

            showSuccessToast('Budget Header Updated!')
            onSuccess?.()
        },
        onError: (err) => {
            console.error("Error updating budget header:", err);
            showErrorToast("Failed to udpate budget header. Please check the input data and try again.",)
        }
    })
}

export const useArchiveBudgetPlan = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
        mutationFn: (plan_id: number) => archiveBudgetPlan(plan_id),
        onMutate: () =>{
            toast.loading("Archiving budget plan ...", { id: "archivePlan" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] })
            showSuccessToast('Budget Plan is archived successfully')
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error archiving budget plan:", err);
            showErrorToast("Failed to archive budget plan")
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
            showSuccessToast('Budget Plan is restored successfully')

            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error restoring budget plan:", err);
            showErrorToast("Failed to restore budget plan")
        }
    })
}

export const useUpdateBudgetItem = (onSuccess: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ updatedItemData, historyRecords }: {
        updatedItemData: Array<{ dtl_id: number, dtl_proposed_budget: number, plan_budgetaryObligations?: number}>,
        historyRecords: Array<{
            bph_source_item: string,
            bph_to_item: string,
            bph_from_new_balance: number,
            bph_to_new_balance: number,
            bph_to_prev_balance: number,
            bph_from_prev_balance: number,
            bph_transfer_amount: number,
            plan: number
        }>
        }) => updateBudgetItem(updatedItemData, historyRecords),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            queryClient.invalidateQueries({ queryKey: ['budgetDetails'] });
            queryClient.invalidateQueries({ queryKey: ['budgetPlanHistory'] });

            showSuccessToast('Budget Items Updated!')
            onSuccess?.()
        },
        onError: (err) => {
            console.error("Error updating budget items:", err);
            showErrorToast("Failed to update budget items. Please check the input data and try again.")
        }
    })
}

