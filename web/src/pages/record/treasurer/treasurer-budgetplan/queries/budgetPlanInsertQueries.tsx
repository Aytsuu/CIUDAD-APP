import z from "zod"
import { budget_plan, budget_plan_details, addBudgetPlanSuppDoc } from "../restful-API/budgetPlanPostAPI"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BudgetPlan } from "../budgetPlanInterfaces"
import { showSuccessToast } from "@/components/ui/toast"
import { showErrorToast } from "@/components/ui/toast"
import { useNavigate } from "react-router"

const BudgetPlanDetailSchema = z.object({
    dtl_budget_item: z.string().min(1, "Budget item is required"),
    dtl_proposed_budget: z.union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val),
});


export const useInsertBudgetPlan = (onSuccess?: (planId?: number) => void) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate()
    

    return useMutation({
        mutationFn: async (values: {
            newBudgetHeader: BudgetPlan;
            newBudgetDetails: z.infer<typeof BudgetPlanDetailSchema>[];
        }) => {

            try {
                const validatedDetails = values.newBudgetDetails.map(detail => {
                    const parsed = BudgetPlanDetailSchema.parse(detail);
                    return {
                        dtl_proposed_budget: parsed.dtl_proposed_budget, 
                        dtl_budget_item: parsed.dtl_budget_item,
                    };
                });

                console.log('Validated header:', values.newBudgetHeader)
                console.log('Validated Details:', validatedDetails)

                const planId = await budget_plan(values.newBudgetHeader);
                if (!planId) throw new Error("Failed to create budget plan");

                console.log('Validated')
                await budget_plan_details(validatedDetails, planId);
                return planId;
            } catch (error) {
                showErrorToast("Failed to create budget plan");
                throw error;
            }
        },
        onSuccess: (planId) => {
            queryClient.invalidateQueries({ queryKey: ['activeBudgetPlan'] });

            showSuccessToast('Budget Plan created successfully')

            
            if (onSuccess) onSuccess(planId);
            navigate('/treasurer-budget-plan')
        },
        onError: () => {
            showErrorToast('Failed to create budget plan');
        }
    });
};


export const useAddBudgetPlanSuppDoc = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            plan_id: number;
            file: { name: string; type: string; file: string | undefined}[];
            description: string;
        }) => {
            return addBudgetPlanSuppDoc(data.plan_id, data.file, data.description);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlanFiles'] });

            showSuccessToast('Documents uploaded successfully!')
            onSuccess?.();
        },
        onError: (err: Error) => {
            console.error("Upload error:", err);
            showErrorToast( "Failed to upload documents. Please try again.")
        }
    });
};