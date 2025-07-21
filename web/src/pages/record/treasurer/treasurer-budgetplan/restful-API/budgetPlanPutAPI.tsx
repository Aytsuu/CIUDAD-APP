import {api} from "@/api/api";
import { parseFloatSafe } from "@/helpers/floatformatter";



export const updateBudgetPlan = async(budgetInfo: Record<string, any>) => {
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



export const updateBudgetDetails = async (details: Array<{ dtl_id?: number; dtl_budget_item?: string; dtl_proposed_budget?: number; dtl_budget_category?: string;}>) => {
  try {
    // Sort details by dtl_id in ascending order
    const sortedDetails = [...details].sort((a, b) => {
      // Handle cases where dtl_id might be undefined (though your types suggest it's optional)
      const idA = a.dtl_id || 0;
      const idB = b.dtl_id || 0;
      return idA - idB;
    });

    const results = await Promise.allSettled(
      sortedDetails.map(item => 
        api.patch(`treasurer/update-budget-details/${item.dtl_id}/`, {
          dtl_proposed_budget: item.dtl_proposed_budget,
          dtl_budget_item: item.dtl_budget_item,
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

export const archiveBudgetPlan = async (planId: number) => {
    try{
        const res = await api.put(`treasurer/update-budget-plan/${planId}/`, {
            plan_is_archive: true
        })

    }catch(err){
        console.error(err)
    }
}

export const restoreBudgetPlan = async (planId: number) => {
    try{
        const res = await api.put(`treasurer/update-budget-plan/${planId}/`, {
            plan_is_archive: false
        })

    }catch(err){
        console.error(err)
    }
}
