import z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BudgetPlan } from "../budgetPlanInterfaces";
import { CircleCheck } from "lucide-react";
import { updateBudgetPlan, updateBudgetDetails } from "../restful-API/budgetPlanPutAPI";

const BudgetPlanDetailSchema = z.object({
    dtl_id: z.number().optional(), 
    dtl_budget_item: z.string().min(1, "Budget item is required"),
    dtl_proposed_budget: z.union([
        z.string(),
        z.number()
    ]).transform(val => typeof val === 'number' ? val.toString() : val),
    dtl_budget_category: z.string().min(1, "Category is required")
});

export const useUpdateBudgetPlan = (plan_id: number, onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: {
            budgetHeader: BudgetPlan;
            budgetDetails: z.infer<typeof BudgetPlanDetailSchema>[];
        }) => {
            toast.loading("Updating Budget plan...", { id: "updateBudgetPlan" });

            console.log('Values:', values.budgetHeader)
        
            try {
                const validatedDetails = values.budgetDetails.map(detail => {
                    const parsed = BudgetPlanDetailSchema.parse(detail);
                    return {
                        dtl_id: parsed.dtl_id,
                        dtl_budget_item: parsed.dtl_budget_item,
                        dtl_proposed_budget: parsed.dtl_proposed_budget,
                        dtl_budget_category: parsed.dtl_budget_category
                    };
                });
        
                // Update budget plan header
                const updatedPlan = await updateBudgetPlan(plan_id, values.budgetHeader);
                if (!updatedPlan) throw new Error("Failed to update budget plan header");
        
                // Filter and type guard
                const detailsToUpdate = validatedDetails
                    .filter((detail): detail is {
                        dtl_id: number;
                        dtl_budget_item: string;
                        dtl_proposed_budget: string;
                        dtl_budget_category: string;
                    } => detail.dtl_id !== undefined);
                
                if (detailsToUpdate.length > 0) {
                    await updateBudgetDetails(detailsToUpdate);
                }
        
                return updatedPlan;
            } catch (error) {
                toast.dismiss("updateBudgetPlan");
                throw error;
            }
        },
        onSuccess: () => {
            toast.success('Budget Plan updated successfully', {
                id: 'updateBudgetPlan',
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            queryClient.invalidateQueries({ queryKey: ['budgetPlanDetails'] });
            
            if (onSuccess) onSuccess();
        },
        onError: (err) => {
            console.error("Error updating budget plan:", err);
            toast.error("Failed to update budget plan", {
                id: 'updateBudgetPlan'
            });
        }
    });
};