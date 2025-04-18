import api from "@/api/api";
import { formatDate } from '@/helpers/dateFormatter';
import { parseFloatSafe } from '@/helpers/floatformatter';
import { capitalize } from "@/helpers/capitalize";


export const updateIncomeExpense = async (iet_num: number, incomeExpenseInfo: Record<string, any>) => {

    try{

        let entry = incomeExpenseInfo.iet_entryType == "0" ? "Income" : "Expense";


        const res = await api.put(`treasurer/update-income-expense-tracking/${iet_num}/`,{

            iet_date: formatDate(new Date().toISOString().split('T')[0]),
            iet_entryType: entry,
            iet_amount: parseFloatSafe(incomeExpenseInfo.iet_amount),
            iet_receiver: capitalize(incomeExpenseInfo.iet_receiver),
            iet_additional_notes: incomeExpenseInfo.iet_additional_notes,
            iet_receipt_image: incomeExpenseInfo.iet_receipt_image,
            inv_num: "None",
            dtl_id:  parseInt(incomeExpenseInfo.iet_particulars)

        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}



export const updateIncomeTracking = async (inc_num: number, incomeInfo: Record<string, any>) => {

    try{

        const res = await api.put(`treasurer/update-income-tracking/${inc_num}/`,{

            inc_date: formatDate(new Date().toISOString().split('T')[0]),
            inc_entryType: "Income",
            inc_amount: parseFloatSafe(incomeInfo.inc_amount),
            inc_additional_notes: incomeInfo.inc_additional_notes,
            inc_receipt_image: incomeInfo.inc_receipt_image || null,
            incp_id:  parseInt(incomeInfo.inc_particulars)

        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}