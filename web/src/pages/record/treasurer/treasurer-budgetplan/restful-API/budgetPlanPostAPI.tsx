import api from '@/api/api'
import { parseFloatSafe } from '@/helpers/floatformatter';

const budget_plan = async (budgetInfo: Record<string, any>) => {
    try {
        console.log({
            plan_year: new Date().getFullYear().toString(),
            plan_actual_income: parseFloatSafe(budgetInfo.plan_actual_income), 
            plan_rpt_income: parseFloatSafe(budgetInfo.plan_rpt_income), 
            plan_balance: parseFloatSafe(budgetInfo.plan_balance), 
            plan_tax_share: parseFloatSafe(budgetInfo.plan_tax_share),
            plan_tax_allotment: parseFloatSafe(budgetInfo.plan_tax_allotment), 
            plan_cert_fees: parseFloatSafe(budgetInfo.plan_cert_fees), 
            plan_other_income: parseFloatSafe(budgetInfo.plan_other_income), 
            plan_budgetaryObligations: parseFloatSafe(budgetInfo.plan_budgetaryObligations),
            plan_balUnappropriated: parseFloatSafe(budgetInfo.plan_balUnappropriated),
            plan_issue_date: new Date().toISOString().split('T')[0], 
            plan_personalService_limit: parseFloatSafe(budgetInfo.plan_personalService_limit),
            plan_miscExpense_limit: parseFloatSafe(budgetInfo.plan_miscExpense_limit),
            plan_localDev_limit: parseFloatSafe(budgetInfo.plan_localDev_limit),
            plan_skFund_limit: parseFloatSafe(budgetInfo.plan_skFund_limit),
            plan_calamityFund_limit: parseFloatSafe(budgetInfo.plan_calamityFund_limit),
        });

        const res = await api.post('treasurer/budget-plan/', {
            plan_year: new Date().getFullYear().toString(),
            plan_actual_income: parseFloatSafe(budgetInfo.plan_actual_income), 
            plan_rpt_income: parseFloatSafe(budgetInfo.plan_rpt_income), 
            plan_balance: parseFloatSafe(budgetInfo.plan_balance), 
            plan_tax_share: parseFloatSafe(budgetInfo.plan_tax_share),
            plan_tax_allotment: parseFloatSafe(budgetInfo.plan_tax_allotment), 
            plan_cert_fees: parseFloatSafe(budgetInfo.plan_cert_fees), 
            plan_other_income: parseFloatSafe(budgetInfo.plan_other_income), 
            plan_budgetaryObligations: parseFloatSafe(budgetInfo.plan_budgetaryObligations),
            plan_balUnappropriated: parseFloatSafe(budgetInfo.plan_balUnappropriated),
            plan_issue_date: new Date().toISOString().split('T')[0], 
            plan_personalService_limit: parseFloatSafe(budgetInfo.plan_personalService_limit),
            plan_miscExpense_limit: parseFloatSafe(budgetInfo.plan_miscExpense_limit),
            plan_localDev_limit: parseFloatSafe(budgetInfo.plan_localDev_limit),
            plan_skFund_limit: parseFloatSafe(budgetInfo.plan_skFund_limit),
            plan_calamityFund_limit: parseFloatSafe(budgetInfo.plan_calamityFund_limit),
        });

        return res.data.plan_id;
    } catch (err) {
        console.error(err);
    }
};

const budget_plan_details = async (detailInfo: Array<{ dtl_budget_item: string; dtl_proposed_budget: string, dtl_budget_category: string }>, planId: number) => {
    try {
        const transformedDetails = detailInfo.map((item) => ({
            dtl_budget_item: item.dtl_budget_item,
            dtl_proposed_budget: parseFloatSafe(item.dtl_proposed_budget) || 0.00,
            dtl_budget_category: item.dtl_budget_category,
            plan: planId,
        }));
        console.log("Submitting Budget Plan Details:", transformedDetails);

        const res = await api.post('treasurer/budget-plan-details/', transformedDetails);
        return res.data;
    } catch (error) {
        const axiosError = error as { response?: { data: any }; message: string };
        console.error("Error submitting budget plan details:", axiosError.response?.data || axiosError.message);
    }
};


export {budget_plan, budget_plan_details}