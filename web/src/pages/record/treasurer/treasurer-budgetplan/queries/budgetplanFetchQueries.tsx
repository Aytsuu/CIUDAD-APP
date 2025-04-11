import { useQuery } from "@tanstack/react-query";
import { getHeaderandAllocation } from "../restful-API/budgetplanGetAPI";
import { getBudgetDetails } from "../restful-API/budgetplanGetAPI";

export type HeaderandAllocation = {
    plan_id: number;
    plan_year: string;
    plan_actual_income: number;
    plan_rpt_income: number;
    plan_balance: number;
    plan_tax_share: number;
    plan_tax_allotment: number;
    plan_cert_fees: number;
    plan_other_income: number;
    plan_budgetaryObligations: number;
    plan_balUnappropriated: number;
    plan_issue_date: string;
    plan_personalService_limit: number,
    plan_miscExpense_limit: number,
    plan_localDev_limit: number,
    plan_skFund_limit: number,
    plan_calamityFund_limit: number,
    budget_detail: BudgetPlanDetail[];
}

export type BudgetPlanDetail = {
    dtl_id: number;
    dtl_budget_item: string;
    dtl_proposed_budget: number;
    dtl_budget_category: string;
    plan: number; 
}

export const HeaderandAllocationQuery = (planId: string) => {
    return useQuery<HeaderandAllocation[]>({
        queryKey: ['budgetPlan', planId],
        queryFn: () => getBudgetDetails(planId!),
        staleTime: 100 * 60 * 30,
    })
}

