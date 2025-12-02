import { api } from "@/api/api";
import { parseFloatSafe } from "@/helpers/floatformatter";
import { capitalize } from "@/helpers/capitalize";


export const income_expense_tracking = async (incomeExpenseInfo: Record<string, any>) => {

    try{


        const res = await api.post('treasurer/income-expense-tracking/',{

            // iet_date: formatDate(new Date().toISOString().split('T')[0]), 
            iet_datetime: incomeExpenseInfo.iet_datetime,
            iet_entryType: "Expense",
            iet_serial_num: incomeExpenseInfo.iet_serial_num,
            iet_check_num: incomeExpenseInfo.iet_check_num,
            iet_amount: parseFloatSafe(incomeExpenseInfo.iet_amount),
            iet_actual_amount: parseFloatSafe(incomeExpenseInfo.iet_actual_amount),
            iet_additional_notes: incomeExpenseInfo.iet_additional_notes,
            inv_num: "urlforInvNum",
            iet_receipt_image: "nothing",
            exp_id:  parseInt(incomeExpenseInfo.iet_particulars),
            staff_id: incomeExpenseInfo.staff_id

        })

        return res.data.iet_num;
    }
    catch (_err){
        // console.error(err);
    }
}


//EXPENSE LOG
export const expense_log = async (iet_num: number, expenseLogInfo: Record<string, any>) => {

    try{
        const currentTimestamp = new Date().toISOString();

        const res = await api.post('treasurer/expense-log/',{

            el_datetime: currentTimestamp,
            el_return_amount: parseFloat(expenseLogInfo.returnAmount || 0).toFixed(2),
            el_proposed_budget: parseFloat(expenseLogInfo.el_proposed_budget || 0).toFixed(2),
            el_actual_expense: parseFloat(expenseLogInfo.el_actual_expense || 0).toFixed(2),
            iet_num: iet_num

        })

        return res.data.iet_num;
    }
    catch (_err){
        // console.error(err);
    }
}


// FILE FOLDER 
export const income_expense_file_create = async (data: {
  iet_num: number;
  file_data: {
    name: string;
    type: string;
    file: any;
  };
}) => {
  try {
    // Create the payload that matches your serializer's _upload_files method
    const payload = {
      iet_num: data.iet_num,
      files: [{
        name: data.file_data.name,
        type: data.file_data.type,
        file: data.file_data.file // The actual file object
      }]
    };

    const res = await api.post('treasurer/inc-exp-file/', payload);
    return res.data;
  } catch (err) {
    // console.error(`Failed to create file ${data.file_data.name}:`, err);
    throw err;
  }
}



// UPDATING THE MAIN CARD
export const updateIncomeExpenseMain = async (ie_year_main: number, ExpenseInfo: Record<string, any>) => {

    try{

        const res = await api.put(`treasurer/update-income-expense-main/${ie_year_main}/`,{

          // ie_main_tot_budget: parseFloatSafe(ExpenseInfo.totalBudget),
          ie_main_exp: parseFloatSafe(ExpenseInfo.totalExpense),
          ie_remaining_bal: parseFloatSafe(ExpenseInfo.totalBudget)

        })

        return res.data;
    }
    catch (_err){
        // console.error(err);
    }
}


export const updateExpenseParticular = async (exp_id: number, ExpenseInfo: Record<string, any>) => {

    try{

        const res = await api.put(`treasurer/update-expense-particular/${ExpenseInfo.years}/${exp_id}/`,{
          
          exp_proposed_budget: parseFloatSafe(ExpenseInfo.exp_proposed_budget)

        })

        return res.data;
    }
    catch (_err){
        // console.error(err);
    }
}



export const updateBudgetPlanDetail = async (dtl_id: number, ExpenseInfo: Record<string, any>) => {

    try{

        const res = await api.put(`treasurer/update-budget-detail/${ExpenseInfo.years}/${dtl_id}/`,{
          
          dtl_proposed_budget: parseFloatSafe(ExpenseInfo.dtl_proposed_budget)

        })

        return res.data;
    }
    catch (_err){
        // console.error(err);
    }
}



// ============================================ INCOME =================================




export const income_tracking = async (incomeInfo: Record<string, any>) => {

    try{

        const res = await api.post('treasurer/income-tracking/',{

            inc_datetime: incomeInfo.inc_datetime,
            inc_entryType: "Income",
            inc_amount: parseFloatSafe(incomeInfo.inc_amount),
            inc_additional_notes: incomeInfo.inc_additional_notes || "None",
            incp_id:  parseInt(incomeInfo.inc_particulars),
            staff_id: incomeInfo.staff_id

        })

        return res.data.inc_num;
    }
    catch (_err){
        // console.error(err);
    }
}



// UPDATING THE MAIN CARD
export const updateIncomeMain = async (ie_year_main: number, ExpenseInfo: Record<string, any>) => {

    try{


        const res = await api.put(`treasurer/update-income-expense-main/${ie_year_main}/`,{

          ie_main_inc: parseFloatSafe(ExpenseInfo.totalIncome)

        })

        return res.data;
    }
    catch (_err){
        // console.error(err);
    }
}