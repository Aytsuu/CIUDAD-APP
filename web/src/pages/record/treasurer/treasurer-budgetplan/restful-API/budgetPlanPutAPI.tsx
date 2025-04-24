import api from "@/api/api";
import { parseFloatSafe } from "@/helpers/floatformatter";


const updateBudgetPlan = async( plan_id: number, budgetInfo: Record<string, any>) => {
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

        const res = await api.put(`treasurer/update-budget-plan/${plan_id}/`,{
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

const updateBudgetDetails = async ( details: Array<{ dtl_id: number; dtl_budget_item?: string; dtl_proposed_budget?: string; dtl_budget_category?: string;}>) => {

    try {
        const transformedUpdates = details.map((item) => ({
            ...item,
            dtl_proposed_budget: item.dtl_proposed_budget !== undefined 
                ? parseFloatSafe(item.dtl_proposed_budget) || 0.00 
                : undefined
        }));

        console.log("Updating Budget Details:", transformedUpdates);

        const updatePromises = transformedUpdates.map((item) =>
            api.put(`treasurer/update-budget-details/${item.dtl_id}/`, {
                dtl_budget_item: item.dtl_budget_item,
                dtl_proposed_budget: item.dtl_proposed_budget,
                dtl_budget_category: item.dtl_budget_category,
            })
        );

        const results = await Promise.all(updatePromises);
        return results.map(res => res.data);
    } catch (error) {
        const axiosError = error as { response?: { data: any }; message: string };
        console.error(
            "Error updating budget details:", 
            axiosError.response?.data || axiosError.message
        );
        throw error; 
    }
};

export {updateBudgetPlan, updateBudgetDetails}