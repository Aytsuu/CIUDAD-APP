import {api} from "@/api/api";
import { parseFloatSafe } from '@/helpers/floatformatter';
import { capitalize } from "@/helpers/capitalize";





export const income_expense_tracking = async (incomeExpenseInfo: Record<string, any>) => {

    try{


        console.log({
            iet_datetime: incomeExpenseInfo.iet_datetime,
            iet_entryType: "Expense",
            iet_serial_num: incomeExpenseInfo.iet_serial_num,
            iet_amount: parseFloatSafe(incomeExpenseInfo.iet_amount),
            iet_is_archive: false,
            iet_receiver: capitalize(incomeExpenseInfo.iet_receiver),
            iet_additional_notes: incomeExpenseInfo.iet_additional_notes,
            exp_id:  parseInt(incomeExpenseInfo.iet_particulars),
            staff_id: "00001250821"
        })

        const res = await api.post('treasurer/income-expense-tracking/',{

            // iet_date: formatDate(new Date().toISOString().split('T')[0]), 
            iet_datetime: incomeExpenseInfo.iet_datetime,
            iet_entryType: "Expense",
            iet_serial_num: incomeExpenseInfo.iet_serial_num,
            iet_amount: parseFloatSafe(incomeExpenseInfo.iet_amount),
            iet_actual_amount: parseFloatSafe(incomeExpenseInfo.iet_actual_amount),
            iet_additional_notes: incomeExpenseInfo.iet_additional_notes,
            inv_num: "urlforInvNum",
            iet_receipt_image: "nothing",
            exp_id:  parseInt(incomeExpenseInfo.iet_particulars),
            staff_id: "00001250821"

        })

        return res.data.iet_num;
    }
    catch (err){
        console.error(err);
    }
}


export const expense_log = async (iet_num: number, expenseLogInfo: Record<string, any>) => {

    try{
        const currentTimestamp = new Date().toISOString();

        console.log({
            el_datetime: currentTimestamp,
            el_return_amount: expenseLogInfo.returnAmount,
            el_proposed_budget: expenseLogInfo.el_proposed_budget,
            el_actual_expense: expenseLogInfo.el_actual_expense,
        })

        const res = await api.post('treasurer/expense-log/',{

            el_datetime: currentTimestamp,
            el_return_amount: expenseLogInfo.returnAmount,
            el_proposed_budget: expenseLogInfo.el_proposed_budget,
            el_actual_expense: expenseLogInfo.el_actual_expense,
            iet_num: iet_num

        })

        return res.data.iet_num;
    }
    catch (err){
        console.error(err);
    }
}

// FILE FOLDER 
// export const income_expense_file_create = async (data: {
//   iet_num: number;
//   file_data: {
//     name: string;
//     type: string;
//     path: string;
//     url: string;
//   };
// }) => {
//   try {
//     const res = await api.post('treasurer/inc-exp-file/', {
//       iet_num: data.iet_num,
//       ief_name: data.file_data.name,
//       ief_type: data.file_data.type,
//       ief_path: data.file_data.path,
//       ief_url: data.file_data.url
//     });
//     return res.data;
//   } catch (err) {
//     console.error(`Failed to create file ${data.file_data.name}:`, err);
//     throw err;
//   }
// }

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
    console.error(`Failed to create file ${data.file_data.name}:`, err);
    throw err;
  }
}


// UPDATING THE MAIN CARD
export const updateIncomeExpenseMain = async (ie_year_main: number, ExpenseInfo: Record<string, any>) => {

    try{
        console.log("DATA OF EXPENSEEEEEEE", {
          iea_year: ie_year_main,
          ie_remaining_bal: ExpenseInfo.totalBudget,
          ie_main_exp: parseFloatSafe(ExpenseInfo.totalExpense)
        })


        const res = await api.put(`treasurer/update-income-expense-main/${ie_year_main}/`,{

          ie_remaining_bal: parseFloatSafe(ExpenseInfo.totalBudget),
          ie_main_exp: parseFloatSafe(ExpenseInfo.totalExpense)

        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}

export const updateExpenseParticular = async (exp_id: number, ExpenseInfo: Record<string, any>) => {

    try{
        console.log({
          exp_id: exp_id,
          exp_year: ExpenseInfo.years,
          exp_proposed_budget: ExpenseInfo.exp_proposed_budget,
        })


        const res = await api.put(`treasurer/update-expense-particular/${ExpenseInfo.years}/${exp_id}/`,{
          
          exp_proposed_budget: parseFloatSafe(ExpenseInfo.exp_proposed_budget)

        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}



export const updateBudgetPlanDetail = async (dtl_id: number, ExpenseInfo: Record<string, any>) => {

    try{
        console.log({
          dtl_id: dtl_id,
          dtl_year: ExpenseInfo.years,
          dtl_proposed_budget: ExpenseInfo.dtl_proposed_budget,
        })


        const res = await api.put(`treasurer/update-budget-detail/${ExpenseInfo.years}/${dtl_id}/`,{
          
          dtl_proposed_budget: parseFloatSafe(ExpenseInfo.dtl_proposed_budget)

        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}




export const income_tracking = async (incomeInfo: Record<string, any>) => {

    try{

        console.log({
            inc_datetime: incomeInfo.inc_datetime,
            inc_serial_num: incomeInfo.inc_serial_num,
            inc_entryType: "Income",
            inc_amount: parseFloatSafe(incomeInfo.inc_amount),
            inc_additional_notes: incomeInfo.inc_additional_notes,
            // inc_receipt_image: incomeInfo.inc_receipt_image || null,
            incp_id:  incomeInfo.inc_particulars,
            staff_id: "00001250821"
        })

        const res = await api.post('treasurer/income-tracking/',{

            inc_datetime: incomeInfo.inc_datetime,
            inc_entryType: "Income",
            inc_amount: parseFloatSafe(incomeInfo.inc_amount),
            inc_additional_notes: incomeInfo.inc_additional_notes || "None",
            // inc_serial_num: "100200",
            // inc_transac_num: "100300",
            // inc_receipt_image: incomeInfo.inc_receipt_image || null,
            incp_id:  parseInt(incomeInfo.inc_particulars),
            staff_id: "00001250821"

        })

        return res.data.inc_num;
    }
    catch (err){
        console.error(err);
    }
}






// UPDATING THE MAIN CARD
export const updateIncomeMain = async (ie_year_main: number, ExpenseInfo: Record<string, any>) => {

    try{
        console.log("CREATING INCOMMMMMMEEEEEE",{
          iea_year: ie_year_main,
          ie_main_inc: parseFloatSafe(ExpenseInfo.totalIncome)
        })


        const res = await api.put(`treasurer/update-income-expense-main/${ie_year_main}/`,{

          ie_main_inc: parseFloatSafe(ExpenseInfo.totalIncome)

        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}