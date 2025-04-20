import api from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";
import { parseFloatSafe } from "@/helpers/floatformatter";

export const updateBudgetPlan = async (plan_id: number, budgetInfo: Record<string, any>) => {
    try {
        // Prepare the main budget plan data
        const planData = {
            plan_year: budgetInfo.plan_year,
            plan_actual_income: parseFloatSafe(budgetInfo.plan_actual_income),
            plan_rpt_income: parseFloatSafe(budgetInfo.plan_rpt_income),
            plan_balance: parseFloatSafe(budgetInfo.plan_balance),
            plan_tax_share: parseFloatSafe(budgetInfo.plan_tax_share),
            plan_tax_allotment: parseFloatSafe(budgetInfo.plan_tax_allotment),
            plan_cert_fees: parseFloatSafe(budgetInfo.plan_cert_fees),
            plan_other_income: parseFloatSafe(budgetInfo.plan_other_income),
            plan_budgetaryObligations: parseFloatSafe(budgetInfo.plan_budgetaryObligations),
            plan_balUnappropriated: parseFloatSafe(budgetInfo.plan_balUnappropriated),
            plan_issue_date: formatDate(new Date().toISOString().split('T')[0]),
            plan_personalService_limit: parseFloatSafe(budgetInfo.plan_personalService_limit),
            plan_miscExpense_limit: parseFloatSafe(budgetInfo.plan_miscExpense_limit),
            plan_localDev_limit: parseFloatSafe(budgetInfo.plan_localDev_limit),
            plan_skFund_limit: parseFloatSafe(budgetInfo.plan_skFund_limit),
            plan_calamityFund_limit: parseFloatSafe(budgetInfo.plan_calamityFund_limit)
        };

        // Prepare the budget details data
        const detailsData = budgetInfo.details.map((detail: any) => ({
            dtl_id: detail.dtl_id,
            dtl_budget_item: detail.dtl_budget_item,
            dtl_proposed_budget: parseFloatSafe(detail.dtl_proposed_budget),
            dtl_budget_category: detail.dtl_budget_category,
            plan_id: plan_id
        }));

        const res = await api.put(`/treasurer/budget-plan/${plan_id}/`, {
            plan_data: planData,
            details_data: detailsData
        });

        return res.data;
    } catch (err) {
        console.error(err);
    }
}