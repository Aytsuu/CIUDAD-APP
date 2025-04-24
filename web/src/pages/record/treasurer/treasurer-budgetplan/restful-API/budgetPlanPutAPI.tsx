import {api} from "@/api/api";
import { parseFloatSafe } from "@/helpers/floatformatter";



const updateBudgetPlan = async(budgetInfo: Record<string, any>) => {
    try{

        console.log({
            plan_actual_income: parseFloatSafe(budgetInfo.plan_actual_income), 
            plan_rpt_income: parseFloatSafe(budgetInfo.plan_rpt_income), 
            plan_balance: parseFloatSafe(budgetInfo.plan_balance), 
            plan_tax_share: parseFloatSafe(budgetInfo.plan_tax_share),
            plan_tax_allotment: parseFloatSafe(budgetInfo.plan_tax_allotment), 
            plan_cert_fees: parseFloatSafe(budgetInfo.plan_cert_fees), 
            plan_other_income: parseFloatSafe(budgetInfo.plan_other_income), 
            plan_budgetaryObligations: parseFloatSafe(budgetInfo.plan_budgetaryObligations),
            plan_balUnappropriated: parseFloatSafe(budgetInfo.plan_balUnappropriated),
            plan_personalService_limit: parseFloatSafe(budgetInfo.plan_personalService_limit),
            plan_miscExpense_limit: parseFloatSafe(budgetInfo.plan_miscExpense_limit),
            plan_localDev_limit: parseFloatSafe(budgetInfo.plan_localDev_limit),
            plan_skFund_limit: parseFloatSafe(budgetInfo.plan_skFund_limit),
            plan_calamityFund_limit: parseFloatSafe(budgetInfo.plan_calamityFund_limit),
        });


        const res = await api.put(`treasurer/update-budget-plan/${budgetInfo.plan_id}/`,{
            plan_actual_income: parseFloatSafe(budgetInfo.plan_actual_income), 
            plan_rpt_income: parseFloatSafe(budgetInfo.plan_rpt_income), 
            plan_balance: parseFloatSafe(budgetInfo.plan_balance), 
            plan_tax_share: parseFloatSafe(budgetInfo.plan_tax_share),
            plan_tax_allotment: parseFloatSafe(budgetInfo.plan_tax_allotment), 
            plan_cert_fees: parseFloatSafe(budgetInfo.plan_cert_fees), 
            plan_other_income: parseFloatSafe(budgetInfo.plan_other_income), 
            plan_budgetaryObligations: parseFloatSafe(budgetInfo.plan_budgetaryObligations),
            plan_balUnappropriated: parseFloatSafe(budgetInfo.plan_balUnappropriated),
            plan_personalService_limit: parseFloatSafe(budgetInfo.plan_personalService_limit),
            plan_miscExpense_limit: parseFloatSafe(budgetInfo.plan_miscExpense_limit),
            plan_localDev_limit: parseFloatSafe(budgetInfo.plan_localDev_limit),
            plan_skFund_limit: parseFloatSafe(budgetInfo.plan_skFund_limit),
            plan_calamityFund_limit: parseFloatSafe(budgetInfo.plan_calamityFund_limit),

        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}


const updateBudgetDetails = async (details: Array<{dtl_id: number; dtl_budget_item?: string; dtl_proposed_budget?: number; dtl_budget_category?: string;}>) => {
    try {
        const results = await Promise.allSettled(
            details.map(item => 
                api.patch(`treasurer/update-budget-details/${item.dtl_id}/`, {
                    dtl_budget_item: item.dtl_budget_item,
                    dtl_proposed_budget: item.dtl_proposed_budget,
                    dtl_budget_category: item.dtl_budget_category,
                })
            )
        );

        // Check for any failures
        const failedUpdates = results.filter(r => r.status === 'rejected');
        if (failedUpdates.length > 0) {
            console.error('Some updates failed:', failedUpdates);
            throw new Error(`${failedUpdates.length} detail updates failed`);
        }

        return results.map(r => 
            r.status === 'fulfilled' ? r.value.data : null
        ).filter(Boolean);
    } catch (error) {
        console.error("Error updating budget details:", error);
        throw error;
    }
};

export {updateBudgetPlan, updateBudgetDetails}