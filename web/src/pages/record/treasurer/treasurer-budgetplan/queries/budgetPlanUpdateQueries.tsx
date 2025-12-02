import {z} from "zod"
import { BudgetPlanStep1Schema } from "@/form-schema/treasurer/budgetplan-schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { updateBudgetHeader, restoreBudgetPlan, archiveBudgetPlan, updateBudgetItem } from "../restful-API/budgetPlanPutAPI";

export const useUpdateBudgetHeader = (onSuccess: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: z.infer<typeof BudgetPlanStep1Schema>) => 
        updateBudgetHeader(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeBudgetPlan'] });
            queryClient.invalidateQueries({ queryKey: ['budgetDetails'] });
            queryClient.invalidateQueries({ queryKey: ['budgetItems'] });

            toast.success('Budget Header Updated!', {
                id: "updateHeader",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            onSuccess?.()
        },
        onError: () => {
            // console.error("Error updating budget header:", err);
            toast.error(
                "Failed to udpate budget header. Please check the input data and try again.",
                { duration: 2000 }
            );
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
            queryClient.invalidateQueries({ queryKey: ['activeBudgetPlan'] })
            queryClient.invalidateQueries({ queryKey: ['inactiveBudgetPlan'] })
            toast.success('Budget Plan is archived successfully', {
                id: "archivePlan",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: () => {
            // console.error("Error archiving budget plan:", err);
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
            queryClient.invalidateQueries({ queryKey: ['activeBudgetPlan'] })
            queryClient.invalidateQueries({ queryKey: ['inactiveBudgetPlan'] });

            toast.success('Budget Plan is restored successfully', {
                id: "restorePlan",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: () => {
            // console.error("Error restoring budget plan:", err);
            toast.error("Failed to restore budget plan", {
            id: "restorePlan",
            duration: 2000
            });
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
            queryClient.invalidateQueries({ queryKey: ['activeBudgetPlan'] });
            queryClient.invalidateQueries({ queryKey: ['budgetDetails'] });
            queryClient.invalidateQueries({ queryKey: ['budgetPlanHistory'] });
    
            toast.success('Budget Items Updated!', {
                id: "updateItems",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            onSuccess?.()
        },
        onError: () => {
            // console.error("Error updating budget items:", err);
            toast.error(
                "Failed to update budget items. Please check the input data and try again.",
                { duration: 2000 }
            );
        }
    })
}

