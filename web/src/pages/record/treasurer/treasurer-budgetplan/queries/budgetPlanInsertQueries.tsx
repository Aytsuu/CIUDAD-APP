import z from "zod"
import { toast } from "sonner"
import { budget_plan, budget_plan_details } from "../restful-API/budgetPlanPostAPI"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BudgetPlan } from "../budgetPlanInterfaces"
import { CircleCheck } from "lucide-react"
import { useNavigate } from "react-router"


const BudgetPlanDetailSchema = z.object({
    dtl_budget_item: z.string().min(1, "Budget item is required"),
    dtl_proposed_budget: z.union([
        z.string(),
        z.number()
    ]).transform(val => typeof val === 'number' ? val.toString() : val),
    dtl_budget_category: z.string().min(1, "Category is required")
});


export const useInsertBudgetPlan = (onSuccess?: (planId?: number) => void) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (values: {
            budgetHeader: BudgetPlan;
            budgetDetails: z.infer<typeof BudgetPlanDetailSchema>[];
        }) => {
            toast.loading("Submitting Budget Plan...", { id: "budgetPlan" });

            try {
                const validatedDetails = values.budgetDetails.map(detail => {
                    const parsed = BudgetPlanDetailSchema.parse(detail);
                    return {
                        dtl_budget_item: parsed.dtl_budget_item,
                        dtl_proposed_budget: parsed.dtl_proposed_budget, 
                        dtl_budget_category: parsed.dtl_budget_category
                    };
                });

                const planId = await budget_plan(values.budgetHeader);
                if (!planId) throw new Error("Failed to create budget plan");

                await budget_plan_details(validatedDetails, planId);
                return planId;
            } catch (error) {
                toast.dismiss("budgetPlan");
                throw error;
            }
        },
        onSuccess: (planId) => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            
            toast.success('Budget Plan created successfully', {
                id: "budgetPlan", 
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });

            navigate(-1)
        
            if (onSuccess) onSuccess(planId);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create budget plan', {
                id: "budgetPlan"
            });
        }
    });
};