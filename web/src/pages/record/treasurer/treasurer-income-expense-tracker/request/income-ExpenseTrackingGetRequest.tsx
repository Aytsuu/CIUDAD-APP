import {api} from "@/api/api";
import { IncomeExpense } from "../queries/treasurerIncomeExpenseFetchQueries";


// EXPENSE DATA
export const getIncomeExpense = async ( 
    page: number = 1, 
    pageSize: number = 10,
    year?: number,
    searchQuery?: string,
    selectedMonth?: string,
    isArchive?: boolean
): Promise<{ results: IncomeExpense[]; count: number }> => {
    try {
        const params: any = { page, page_size: pageSize };
        
        if (year) params.year = year;
        if (searchQuery) params.search = searchQuery;
        if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
        if (isArchive !== undefined) params.is_archive = isArchive; 
        
        const res = await api.get('treasurer/income-expense-tracking/', { params });
        
        if (res.data.results !== undefined) {
            return {
                results: res.data.results || [],
                count: res.data.count || 0
            };
        }
        
        return {
            results: Array.isArray(res.data) ? res.data : [],
            count: Array.isArray(res.data) ? res.data.length : 0
        };
    } catch (err) {
        console.error(err);
        return { results: [], count: 0 };
    }
};




export const getIncomeData = async (year?: number, searchQuery?: string, selectedMonth?: string) => {
    try {
        const params: any = {};
        if (year) params.year = year;
        if (searchQuery) params.search = searchQuery;
        if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
        
        const res = await api.get('treasurer/income-tracking/', { params });
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};



//MAIN CARD
export const getIncomeExpenseMainCard = async (searchQuery?: string) => {
    try {
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        
        const res = await api.get('treasurer/income-expense-main/', { params });
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};



// RETRIEVE EXPENSE LOG
export const getExpenseLog = async (year?: number, searchQuery?: string, selectedMonth?: string) => {
    try {
        const params: any = {};
        if (year) params.year = year;
        if (searchQuery) params.search = searchQuery;
        if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
        
        const res = await api.get('treasurer/expense-log/', { params });
        console.log("EXPENSE LOG PO: ", res);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};