import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteBudgetPlan, deleteBudgetPlanFile } from "../restful-API/budgetPlanDeleteAPI";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useDeleteBudgetPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBudgetPlan,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['budgetPlan'] });
            toast.loading("Deleting budget plan...", { id: 'deleteBudgetplan' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            showSuccessToast("Budget Plan deleted successfully")
        },
        onError: (err) => {
            showErrorToast("Failed to delete budget plan")
            console.error("Failed to delete entry:", err);
        }
    });
};

export const useDeleteBudgetPlanFile = () => {
    const queryClient = useQueryClient();

      return useMutation({
        mutationFn: deleteBudgetPlanFile,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['budgetPlanFiles'] });
            toast.loading("Deleting...", { id: 'deleteBudgetplanfile' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlanFiles'] });
            showSuccessToast("Document deleted successfully")
        },
        onError: (err) => {
            showErrorToast("Failed to delete document")
            console.error("Failed to delete file:", err);
        }
    });
}