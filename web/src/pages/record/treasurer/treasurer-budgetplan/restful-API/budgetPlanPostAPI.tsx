import {api} from '@/api/api'
import { parseFloatSafe } from '@/helpers/floatformatter';
import { BudgetHeaderUpdate, ProcessedOldBudgetDetail } from '../budgetPlanInterfaces';


export const budget_plan = async (budgetInfo: Record<string, any>) => {
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
            plan_is_archive: false,
        });

        return res.data.plan_id;
    } catch (err) {
        console.error(err);
    }
};

export const budget_plan_details = async (detailInfo: Array<{ dtl_proposed_budget: number, dtl_budget_item: string, dtl_budget_category: string }>, planId: number) => {
    try {
        const transformedDetails = detailInfo.map((item) => ({
            dtl_proposed_budget: item.dtl_proposed_budget || 0.00,
            dtl_budget_item: item.dtl_budget_item,
            dtl_budget_category: item.dtl_budget_category,
            plan: planId,
        }));
        console.log("Submitting Budget Plan Details:", transformedDetails);

        const res = await api.post('treasurer/budget-plan-detail/', transformedDetails);
        return res.data;
    } catch (error) {
        const axiosError = error as { response?: { data: any }; message: string };
        console.error("Error submitting budget plan details:", axiosError.response?.data || axiosError.message);
    }
};



// budgetPlanPostAPI.ts
export const createBudgetPlanHistory = async (headerHistoryInfo: BudgetHeaderUpdate) => {
    try {
        console.log({
            plan: headerHistoryInfo.plan_id,
            bph_change_date: new Date().toISOString().toString(),
            bph_year: new Date().getFullYear().toString(),
            bph_actual_income: headerHistoryInfo.plan_actual_income,
            bph_rpt_income: headerHistoryInfo.plan_rpt_income,
            bph_balance: headerHistoryInfo.plan_balance,
            bph_tax_share: headerHistoryInfo.plan_tax_share,
            bph_tax_allotment: headerHistoryInfo.plan_tax_allotment,
            bph_cert_fees: headerHistoryInfo.plan_cert_fees,
            bph_other_income: headerHistoryInfo.plan_other_income,
            bph_budgetaryObligations: headerHistoryInfo.plan_budgetaryObligations,
            bph_balUnappropriated: headerHistoryInfo.plan_balUnappropriated,
            bph_personalService_limit: headerHistoryInfo.plan_personalService_limit,
            bph_miscExpense_limit: headerHistoryInfo.plan_miscExpense_limit,
            bph_localDev_limit: headerHistoryInfo.plan_localDev_limit,
            bph_skFund_limit: headerHistoryInfo.plan_skFund_limit,
            bph_calamityFund_limit: headerHistoryInfo.plan_calamityFund_limit,
        })
        const res = await api.post('treasurer/budget-plan-history/', {
            plan: headerHistoryInfo.plan_id,
            bph_change_date: new Date().toISOString().toString(),
            bph_year: new Date().getFullYear().toString(),
            bph_actual_income: headerHistoryInfo.plan_actual_income,
            bph_rpt_income: headerHistoryInfo.plan_rpt_income,
            bph_balance: headerHistoryInfo.plan_balance,
            bph_tax_share: headerHistoryInfo.plan_tax_share,
            bph_tax_allotment: headerHistoryInfo.plan_tax_allotment,
            bph_cert_fees: headerHistoryInfo.plan_cert_fees,
            bph_other_income: headerHistoryInfo.plan_other_income,
            bph_budgetaryObligations: headerHistoryInfo.plan_budgetaryObligations,
            bph_balUnappropriated: headerHistoryInfo.plan_balUnappropriated,
            bph_personalService_limit: headerHistoryInfo.plan_personalService_limit,
            bph_miscExpense_limit: headerHistoryInfo.plan_miscExpense_limit,
            bph_localDev_limit: headerHistoryInfo.plan_localDev_limit,
            bph_skFund_limit: headerHistoryInfo.plan_skFund_limit,
            bph_calamityFund_limit: headerHistoryInfo.plan_calamityFund_limit,
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const createBudgetPlanDetailHistory = async (bph_id: string, detailHistory: ProcessedOldBudgetDetail) => {
    try {
        console.log('Test',{ 
            bph: bph_id,
            bpdh_budget_item: detailHistory.budget_item,
            bpdh_proposed_budget: detailHistory.proposed_budget.toString(),
            bpdh_budget_category: detailHistory.category,
            bpdh_is_changed: detailHistory.is_changed
        })

        const res = await api.post('treasurer/budget-plan-detail-history/', {
            bph: bph_id,
            bpdh_budget_item: detailHistory.budget_item,
            bpdh_proposed_budget: detailHistory.proposed_budget.toString(),
            bpdh_budget_category: detailHistory.category,
            bpdh_is_changed: detailHistory.is_changed
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const addBudgetPlanSuppDoc = async ( plan_id: number, files: { name: string; type: string; file: string | undefined }[], description: string
) => {
    try {
        const data = {
            plan_id,
            bpf_description: description,
            files: files.map(file => ({
                name: file.name,
                type: file.type,
                file: file.file  
            }))
        };

        console.log(data)

        const response = await api.post('treasurer/budget-plan-file/', data);

        return response.data;
    } catch (error: any) {
        console.error('Upload failed:', error.response?.data || error);
        throw error;
    }
};