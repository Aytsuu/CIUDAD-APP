import { useQuery } from "@tanstack/react-query";
import { getIncomeExpense } from "../request/income-ExpenseTrackingGetRequest";
import { getParticulars } from "../request/particularsGetRequest";
import { getIncomeData } from "../request/income-ExpenseTrackingGetRequest";
import { getIncomeParticulars } from "../request/particularsGetRequest";

// FETCHING EXPENSE DATA
export type IncomeExpense = {
    iet_num: number;
    iet_serial_num: string;
    iet_date: string;
    dtl_budget_item: string;
    dtl_id: number;
    iet_amount: number;
    iet_entryType: "Income" | "Expense";
    iet_additional_notes: string;
    iet_receipt_image: string;
    inv_num: string;
};
  
// Retrieving income/expense data
export const useIncomeExpense = () => {
    return useQuery<IncomeExpense[]>({
        queryKey: ["incomeExpense"],
        queryFn: getIncomeExpense,
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
};




//FETCHING EXPENSE PARTICULAR
export interface BudgetItem {
    id: string;
    name: string;
    proposedBudget: number;
}


export const useBudgetItems = () => {
    return useQuery<BudgetItem[]>({
        queryKey: ['budgetItems'],
        queryFn: async () => {
        const data = await getParticulars();
        return data.map((item: any) => ({
            id: item.dtl_id.toString(),
            name: item.dtl_budget_item,
            proposedBudget: parseFloat(item.dtl_proposed_budget)
        }));
        },
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
};




//FETCHIN INCOME PARTICULAR
export interface IncomeParticular{
    id: string;
    name: string;
}


export const useIncomeParticular = () => {
    return useQuery<IncomeParticular[]>({
            queryKey: ['incomeParticulars'],
            queryFn: async () => {
            const data = await getIncomeParticulars();
            return data.map((item: any) => ({
                id: item.incp_id.toString(),
                name: item.incp_item
            }));
        },
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
    
};



export type Income = {
    inc_num: number;
    inc_serial_num: string;
    inc_date: string;
    incp_item: string;
    incp_id: number;
    inc_amount: number;
    inc_entryType: "Income" | "Expense";
    inc_additional_notes: string;
    iet_receipt_image: string;
};

export const useIncomeData = () => {
    return useQuery<Income[]>({
        queryKey: ["income"],
        queryFn: getIncomeData,
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
};