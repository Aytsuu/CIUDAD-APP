import api from "@/api/api";
import { formatDate } from '@/helpers/dateFormatter';
import { parseFloatSafe } from '@/helpers/floatformatter';
import { capitalize } from "@/helpers/capitalize";


export const income_expense_tracking = async (incomeExpenseInfo: Record<string, any>) => {

    try{

        let entry = incomeExpenseInfo.iet_entryType == "0" ? "Income" : "Expense";

        console.log({
            iet_date: formatDate(new Date().toISOString().split('T')[0]),
            iet_entryType: "Expense",
            iet_amount: parseFloatSafe(incomeExpenseInfo.iet_amount),
            iet_particulars:  parseInt(incomeExpenseInfo.iet_particulars),
            iet_receiver: capitalize(incomeExpenseInfo.iet_receiver),
            iet_additional_notes: incomeExpenseInfo.iet_additional_notes,
            iet_receipt_image: incomeExpenseInfo.iet_receipt_image,
            dtl_id:  parseInt(incomeExpenseInfo.iet_particulars)
        })

        const res = await api.post('treasurer/income-expense-tracking/',{

            iet_date: formatDate(new Date().toISOString().split('T')[0]),
            iet_entryType: "Expense",
            iet_amount: parseFloatSafe(incomeExpenseInfo.iet_amount),
            iet_additional_notes: incomeExpenseInfo.iet_additional_notes,
            iet_receipt_image: "urlfornow",
            inv_num: "urlforInvNum",
            dtl_id:  parseInt(incomeExpenseInfo.iet_particulars)

        })

        return res.data.iet_num;
    }
    catch (err){
        console.error(err);
    }
}




export const income_tracking = async (incomeInfo: Record<string, any>) => {

    try{

        const res = await api.post('treasurer/income-tracking/',{

            inc_date: formatDate(new Date().toISOString().split('T')[0]),
            inc_entryType: "Income",
            inc_amount: parseFloatSafe(incomeInfo.inc_amount),
            inc_additional_notes: incomeInfo.inc_additional_notes,
            inc_receipt_image: "urlfornow",
            incp_id:  1

        })

        return res.data.inc_num;
    }
    catch (err){
        console.error(err);
    }
}