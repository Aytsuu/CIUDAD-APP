import z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { updateBudgetPlan, updateBudgetDetails } from "../restful-API/budgetPlanPutAPI";
import { useNavigate } from "react-router";

type BudgetHeaderUpdate ={
    plan_id?: number,
    plan_actual_income: number,
    plan_rpt_income: number,
    plan_balance: number,
    plan_tax_share: number,
    plan_tax_allotment: number,
    plan_cert_fees: number,
    plan_other_income: number,
    plan_budgetaryObligations: number, 
    plan_balUnappropriated: number,
    plan_personalService_limit: number,
    plan_miscExpense_limit: number,
    plan_localDev_limit: number, 
    plan_skFund_limit: number,
    plan_calamityFund_limit: number,
}

type BudgetDetailUpdate = {
    dtl_id: number;
    dtl_budget_item?: string;
    dtl_proposed_budget?: number;
    dtl_budget_category?: string;
};

export const useUpdateBudgetPlan = (onSuccess?: (planId?: number) => void) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (values: {
            budgetHeader: BudgetHeaderUpdate,
            budgetDetails: BudgetDetailUpdate[]
        }) => {
            toast.loading("Updating Budget plan...", { id: "updateBudgetPlan" });

            try {
                const headerResponse = await updateBudgetPlan(values.budgetHeader);
                if (!headerResponse) throw new Error("Budget header update failed");

                if (values.budgetDetails?.length > 0) {
                    const detailsResponse = await updateBudgetDetails(values.budgetDetails);
                    if (!detailsResponse || detailsResponse.length !== values.budgetDetails.length) {
                        throw new Error("Some budget details failed to update");
                    }
                }

                return values.budgetHeader.plan_id;
            } catch (error) {
                console.error("Update error:", error);
                throw error;
            }
        },
        onSuccess: (planId) => {
            toast.success('Budget Plan updated successfully', {
                id: 'updateBudgetPlan',
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });

            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            queryClient.invalidateQueries({ queryKey: ['budgetPlanDetails'] });

            onSuccess?.(planId);
            navigate("/treasurer-budgetplan-view", { state: { planId } });
        },
        onError: (error: any) => {
            console.error("Mutation error:", error);
            toast.error(`Failed to update budget plan: ${error.message}`, {
                id: 'updateBudgetPlan'
            });
        }
    });
};
