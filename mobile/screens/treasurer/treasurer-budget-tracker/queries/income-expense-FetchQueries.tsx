import { useQuery } from "@tanstack/react-query";
import { getIncomeExpenseMainCard } from "../request/income-expense-GetRequest";
import { getIncomeExpense } from "../request/income-expense-GetRequest";
import { getParticulars } from "../request/income-expense-GetRequest";
import { getIncomeData } from "../request/income-expense-GetRequest";
import { getIncomeParticulars } from "../request/particular-GetRequest";

// INCOME EXPENSE MAIN CARD
export type IncomeExpenseCard = {
    ie_main_year: string;
    ie_main_tot_budget: number;
    ie_remaining_bal: number;
    ie_main_inc: number;
    ie_main_exp: number;
};


export const useIncomeExpenseMainCard = () => {
    return useQuery<IncomeExpenseCard[]>({
        queryKey: ["income_expense_card"],
        queryFn: getIncomeExpenseMainCard,
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
};



// RETRIEVE EXPENSE
export type IncomeExpense = {
    iet_num: number;
    iet_serial_num: string;
    iet_datetime: string;
    dtl_budget_item: string;
    dtl_id: number;
    iet_amount: number;
    iet_actual_amount: number;
    iet_entryType: "Income" | "Expense";
    iet_additional_notes: string;
    iet_receipt_image: string;
    iet_is_archive: boolean;
    inv_num: string;
    files: {  
        ief_id: number;
        ief_url: string;
        ief_name: string;
    }[];
};
  

export const useIncomeExpense = (year?: number) => {
    return useQuery<IncomeExpense[]>({
        queryKey: ["incomeExpense", year], // Year in queryKey for proper caching
        queryFn: () => getIncomeExpense(year),
        staleTime: 1000 * 60 * 30,
    });
};



// EXPENSE PARTICULAR
export interface BudgetItem {
    id: string;
    name: string;
    proposedBudget: number;
}

export const useBudgetItems = (year?: number) => {
    return useQuery<BudgetItem[]>({
        queryKey: ['budgetItems', year],
        queryFn: async () => {
            const response = await getParticulars(year);
            const items = Array.isArray(response) ? response : response?.data;
            
            if (!items) {
                console.warn("No items found in response", response);
                return [];
            }
            
            return items.map((item: any) => ({
                id: item.dtl_id?.toString() || '',
                name: item.dtl_budget_item || 'Unnamed',
                proposedBudget: Number(item.dtl_proposed_budget) || 0
            }));
        },
        staleTime: 1000 * 60 * 30,
    });
};



// ============================================ INCOMEEE ==================================



export type Income = {
    inc_num: number;
    inc_serial_num: string;
    inc_transac_num: string;
    inc_datetime: string;
    incp_item: string;
    incp_id: number;
    inc_amount: number;
    inc_entryType: "Income" | "Expense";
    inc_additional_notes: string;
    inc_receipt_image: string;
    inc_is_archive: boolean;
};


export const useIncomeData = (year?: number) => {
    return useQuery<Income[]>({
        queryKey: ["income", year],
        queryFn: () => getIncomeData(year),
        staleTime: 1000 * 60 * 30,
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