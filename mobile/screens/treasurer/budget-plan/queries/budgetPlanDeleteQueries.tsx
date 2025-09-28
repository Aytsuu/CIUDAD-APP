import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { deleteBudgetPlan, deleteBudgetPlanFile } from "../restful-API/budgetPlanDeleteAPI";

export const useDeleteBudgetPlan = () => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext();

    return useMutation({
        mutationFn: deleteBudgetPlan,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['budgetPlan'] });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            toast.success("Budget Plan deleted successfully")
        },
        onError: (err) => {
            toast.error("Failed to delete budget plan")
            console.error("Failed to delete entry:", err);
        }
    });
};

export const useDeleteBudgetPlanFile = () => {
    const queryClient = useQueryClient();
     const {toast} = useToastContext();
      return useMutation({
        mutationFn: deleteBudgetPlanFile,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['budgetPlanFiles'] });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlanFiles'] });
            toast.success("Document deleted successfully")
        },
        onError: (err) => {
            toast.error("Failed to delete document")
            console.error("Failed to delete file:", err);
        }
    });
}