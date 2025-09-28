import { useQueryClient, useMutation } from "@tanstack/react-query";
import { archiveBudgetPlan, restoreBudgetPlan } from "../restful-API/budgetPlanPutAPI";
import { useToastContext } from "@/components/ui/toast";

export const useArchiveBudgetPlan = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext();

     return useMutation({
        mutationFn: (plan_id: number) => archiveBudgetPlan(plan_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] })
            queryClient.invalidateQueries({ queryKey: ['budgetDetails'] })
            toast.success('Budget Plan is archived successfully')
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error archiving budget plan:", err);
            toast.error("Failed to archive budget plan")
        }
    })
}

export const useRestoreBudgetPlan = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext();

     return useMutation({
        mutationFn: (plan_id: number) => restoreBudgetPlan(plan_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] })
            queryClient.invalidateQueries({ queryKey: ['budgetDetails'] })
            toast.success('Budget Plan is restored successfully')
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error restoring budget plan:", err);
            toast.error("Failed to restore budget plan")
        }
    })
}