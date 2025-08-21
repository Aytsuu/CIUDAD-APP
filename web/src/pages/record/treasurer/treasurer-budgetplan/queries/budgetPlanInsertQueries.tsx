import z from "zod"
import { toast } from "sonner"
import { budget_plan, budget_plan_details, addBudgetPlanSuppDoc } from "../restful-API/budgetPlanPostAPI"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BudgetPlan } from "../budgetPlanInterfaces"
import { CircleCheck } from "lucide-react"


const BudgetPlanDetailSchema = z.object({
    dtl_budget_item: z.string().min(1, "Budget item is required"),
    dtl_proposed_budget: z.union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val),
    dtl_budget_category: z.string().min(1, "Category is required")
});


export const useInsertBudgetPlan = (onSuccess?: (planId?: number) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: {
            newBudgetHeader: BudgetPlan;
            newBudgetDetails: z.infer<typeof BudgetPlanDetailSchema>[];
        }) => {
            // toast.loading("Submitting Budget Plan...", { id: "budgetPlan" });

            try {
                const validatedDetails = values.newBudgetDetails.map(detail => {
                    const parsed = BudgetPlanDetailSchema.parse(detail);
                    return {
                        dtl_proposed_budget: parsed.dtl_proposed_budget, 
                        dtl_budget_item: parsed.dtl_budget_item,
                        dtl_budget_category: parsed.dtl_budget_category
                    };
                });

                const planId = await budget_plan(values.newBudgetHeader);
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

            
            if (onSuccess) onSuccess(planId);
            window.location.href = "/treasurer-budget-plan";
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create budget plan', {
                id: "budgetPlan"
            });
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
            
            toast.success('Documents uploaded successfully!', {
                id: "uploadBudgetDocs",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            onSuccess?.();
        },
        onError: (err: Error) => {
            console.error("Upload error:", err);
            toast.error(
                err.message || "Failed to upload documents. Please try again.",
                { id: "uploadBudgetDocs", duration: 2000 }
            );
        }
    });
};