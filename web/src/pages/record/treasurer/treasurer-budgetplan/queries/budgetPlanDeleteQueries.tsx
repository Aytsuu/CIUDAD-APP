import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteBudgetPlan, deleteBudgetPlanFile } from "../restful-API/budgetPlanDeleteAPI";

export const useDeleteBudgetPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBudgetPlan,
        onMutate: async (plan_id) => {
            await queryClient.cancelQueries({ queryKey: ['budgetPlan'] });
            toast.loading("Deleting budget plan...", { id: 'deleteBudgetplan' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            toast.success("Budget Plan deleted successfully", {
                id: "deleteBudgetplan",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
        },
        onError: (err) => {
            toast.error("Failed to delete budget plan", {
                id: "deleteBudgetplan",
                duration: 1000
            });
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
            toast.success("Document deleted successfully", {
                id: "deleteBudgetplanfile",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
        },
        onError: (err) => {
            toast.error("Failed to delete document", {
                id: "deleteBudgetplanfile",
                duration: 1000
            });
            console.error("Failed to delete file:", err);
        }
    });
}