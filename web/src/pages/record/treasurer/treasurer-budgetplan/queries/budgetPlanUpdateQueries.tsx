import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBudgetPlan } from "../restful-API/budgetPlanPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

export const useUpdateBudgetPlan = (plan_id: number, onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (budgetInfo: Record<string, any>) => 
            updateBudgetPlan(plan_id, budgetInfo),
        onSuccess: () => {
            // Show success notification
            toast.success('Budget plan updated successfully', {
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            // Invalidate relevant queries
            queryClient.invalidateQueries(['budgetPlan', plan_id]);
            queryClient.invalidateQueries(['budgetPlanDetails', plan_id]);
            
            // Execute success callback if provided
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            toast.error('Failed to update budget plan', {
                duration: 2000
            });
            console.error("Error updating budget plan:", error);
        }
    });
}