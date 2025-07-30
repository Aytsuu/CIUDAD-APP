import {api} from "@/api/api";
import { parseFloatSafe } from "@/helpers/floatformatter";

export const updateBudgetHeader = async(budgetInfo: Record<string, any>) => {
    try{

      const newuBalUnappropiated = (Number(budgetInfo.realtyTaxShare) + 
                                    Number(budgetInfo.balance) + Number(budgetInfo.taxAllotment) +
                                    Number(budgetInfo.clearanceAndCertFees) + Number(budgetInfo.otherSpecificIncome)) 
                                    - Number(budgetInfo.budgetaryObligations)

        console.log({
            plan_actual_income: parseFloatSafe(budgetInfo.actualIncome), 
            plan_rpt_income: parseFloatSafe(budgetInfo.actualRPT), 
            plan_balance: parseFloatSafe(budgetInfo.balance), 
            plan_tax_share: parseFloatSafe(budgetInfo.realtyTaxShare),
            plan_tax_allotment: parseFloatSafe(budgetInfo.taxAllotment), 
            plan_cert_fees: parseFloatSafe(budgetInfo.clearanceAndCertFees), 
            plan_other_income: parseFloatSafe(budgetInfo.otherSpecificIncome), 
            plan_balUnappropriated: parseFloatSafe(newuBalUnappropiated),
            planId: budgetInfo.planId
        });


        const res = await api.put(`treasurer/update-budget-plan/${budgetInfo.planId}/`,{
            plan_actual_income: parseFloatSafe(budgetInfo.actualIncome), 
            plan_rpt_income: parseFloatSafe(budgetInfo.actualRPT), 
            plan_balance: parseFloatSafe(budgetInfo.balance), 
            plan_tax_share: parseFloatSafe(budgetInfo.realtyTaxShare),
            plan_tax_allotment: parseFloatSafe(budgetInfo.taxAllotment), 
            plan_cert_fees: parseFloatSafe(budgetInfo.clearanceAndCertFees), 
            plan_other_income: parseFloatSafe(budgetInfo.otherSpecificIncome), 
            plan_balUnappropriated: parseFloatSafe(newuBalUnappropiated),
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}

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

export const updateBudgetItem = async ( budgetItems: Array<{ dtl_id: number, dtl_proposed_budget: number }>,
  historyRecords: Array<{
    bph_source_item: string,
    bph_to_item: string,
    bph_from_new_balance: number,
    bph_to_new_balance: number,
    bph_transfer_amount: number,
    plan: number
  }>
) => {    
    try {
        const updatePromises = budgetItems.map(item => 
            api.put(`treasurer/update-budget-details/${item.dtl_id}/`, {
                dtl_proposed_budget: item.dtl_proposed_budget
            })
        );
        const results = await Promise.all(updatePromises);

        await addHistory(historyRecords);
        return results;
    } catch(err) {
        console.error(err);
        throw err; 
    }
}

const addHistory = async ( historyRecords: Array<{
    bph_source_item: string,
    bph_to_item: string,
    bph_from_new_balance: number,
    bph_to_new_balance: number,
    bph_transfer_amount: number,
    plan: number
  }>
) => {
   try {
    const recordsWithDate = historyRecords.map(record => ({
      ...record,
      bph_date_updated: new Date().toISOString()
    }));

    console.log("Sending history records:", recordsWithDate);

    const res = await api.post('treasurer/budget-plan-history/', recordsWithDate);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

