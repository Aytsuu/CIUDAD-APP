import { useQuery } from "@tanstack/react-query";
import { getIncomeExpense } from "../request/income-ExpenseTrackingGetRequest";
import { getExpenseParticulars } from "../request/particularsGetRequest";
import { getExpenseLog } from "../request/income-ExpenseTrackingGetRequest";
import { getIncomeData } from "../request/income-ExpenseTrackingGetRequest";
import { getIncomeParticulars } from "../request/particularsGetRequest";
import { getIncomeExpenseMainCard } from "../request/income-ExpenseTrackingGetRequest";


// FETCHING EXPENSE DATA
export type IncomeExpense = {
    iet_num: number;
    iet_serial_num: string;
    iet_check_num: string;
    iet_datetime: string;
    exp_budget_item: string;
    exp_id: number;
    iet_amount: number;
    iet_actual_amount: number;
    iet_entryType: "Income" | "Expense";
    iet_additional_notes: string;
    iet_receipt_image: string;
    iet_is_archive: boolean;
    inv_num: string;
    staff_name: string;
    files: {  
        ief_id: number;
        ief_url: string;
        ief_name: string;
    }[];
};
  

export const useIncomeExpense = (year?: number, searchQuery?: string, selectedMonth?: string) => {
    return useQuery<IncomeExpense[]>({
        queryKey: ["incomeExpense", year, searchQuery, selectedMonth],
        queryFn: () => getIncomeExpense(year, searchQuery, selectedMonth),
        staleTime: 1000 * 60 * 30,
    });
};




export interface BudgetItem {
    id: string;
    name: string;
    proposedBudget: number;
}

export const useBudgetItems = (year?: number) => {
    return useQuery<BudgetItem[]>({
        queryKey: ['budgetItems', year],
        queryFn: async () => {
            const response = await getExpenseParticulars(year);
            const items = Array.isArray(response) ? response : response?.data;
            
            if (!items) {
                console.warn("No items found in response", response);
                return [];
            }
            
            return items.map((item: any) => ({
                id: item.exp_id?.toString() || '',
                name: item.exp_budget_item || 'Unnamed',
                proposedBudget: Number(item.exp_proposed_budget) || 0
            }));
        },
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
    staff_name: string;
};



export const useIncomeData = (year?: number, searchQuery?: string, selectedMonth?: string) => {
    return useQuery<Income[]>({
        queryKey: ["income", year, searchQuery, selectedMonth],
        queryFn: () => getIncomeData(year, searchQuery, selectedMonth),
        staleTime: 1000 * 60 * 30,
    });
};




// INCOME EXPENSE MAIN CARD
export type IncomeExpenseCard = {
    ie_main_year: string;
    ie_main_tot_budget: number;
    ie_remaining_bal: number;
    ie_main_inc: number;
    ie_main_exp: number;
};


export const useIncomeExpenseMainCard = (searchQuery?: string) => {
    return useQuery({
        queryKey: ["income_expense_card", searchQuery],
        queryFn: () => getIncomeExpenseMainCard(searchQuery),
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
};




//EXPENSE LOG
export type ExpenseLog = {
    el_id: number;
    el_datetime: string;
    el_particular: string;
    el_proposed_budget: number;
    el_actual_expense: number;
    el_return_amount: number;
    el_is_archive: boolean;
    staff_name: string;
};


export const useExpenseLog = (year?: number, searchQuery?: string, selectedMonth?: string) => {
    return useQuery<ExpenseLog[]>({
        queryKey: ["expense_log", year, searchQuery, selectedMonth],
        queryFn: () => getExpenseLog(year, searchQuery, selectedMonth),
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
};