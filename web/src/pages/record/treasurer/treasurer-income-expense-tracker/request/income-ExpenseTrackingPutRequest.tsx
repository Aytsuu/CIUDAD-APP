import api from "@/api/api";
import { formatDate } from '@/helpers/dateFormatter';
import { parseFloatSafe } from '@/helpers/floatformatter';
import { capitalize } from "@/helpers/capitalize";


export const updateIncomeExpense = async (iet_num: number, incomeExpenseInfo: Record<string, any>) => {

    try{

        let entry = incomeExpenseInfo.iet_entryType == "0" ? "Income" : "Expense";

        console.log({
            iet_date: formatDate(new Date().toISOString().split('T')[0]),
            iet_entryType: entry,
            iet_amount: parseFloatSafe(incomeExpenseInfo.iet_amount),
            iet_particulars:  capitalize(incomeExpenseInfo.iet_particulars),
            iet_receiver: capitalize(incomeExpenseInfo.iet_receiver),
            iet_additional_notes: incomeExpenseInfo.iet_additional_notes,
            iet_receipt_image: "urlfornow",
        })

        const res = await api.put(`treasurer/update-income-expense-tracking/${iet_num}/`,{

            iet_date: formatDate(new Date().toISOString().split('T')[0]),
            iet_entryType: entry,
            iet_amount: parseFloatSafe(incomeExpenseInfo.iet_amount),
            iet_receiver: capitalize(incomeExpenseInfo.iet_receiver),
            iet_additional_notes: incomeExpenseInfo.iet_additional_notes,
            iet_receipt_image: "urlfornow",
            inv_num: "None",
            dtl_id:  parseInt(incomeExpenseInfo.iet_particulars)

        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}