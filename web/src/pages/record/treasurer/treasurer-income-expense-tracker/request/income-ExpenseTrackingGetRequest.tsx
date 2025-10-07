import {api} from "@/api/api";
import { IncomeExpense, Income, ExpenseLog, IncomeExpenseCard } from "../queries/treasurerIncomeExpenseFetchQueries";


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




// INCOME DATA
export const getIncomeData = async (
    page: number = 1, 
    pageSize: number = 10,
    year?: number, 
    searchQuery?: string, 
    selectedMonth?: string,
    isArchive?: boolean
): Promise<{ results: Income[]; count: number }> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (year) params.year = year;
        if (searchQuery) params.search = searchQuery;
        if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
        if (isArchive !== undefined) params.is_archive = isArchive; // Add archive filter
        
        const res = await api.get('treasurer/income-tracking/', { params });
        
        // Handle paginated response
        if (res.data.results !== undefined) {
            return {
                results: res.data.results || [],
                count: res.data.count || 0
            };
        }
        
        // Fallback for non-paginated response
        return {
            results: Array.isArray(res.data) ? res.data : [],
            count: Array.isArray(res.data) ? res.data.length : 0
        };
    } catch (err) {
        console.error(err);
        return { results: [], count: 0 };
    }
};




//MAIN CARD
export const getIncomeExpenseMainCard = async (
    page: number = 1, 
    pageSize: number = 10,
    searchQuery?: string
): Promise<{ results: IncomeExpenseCard[]; count: number }> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        
        const res = await api.get('treasurer/income-expense-main/', { params });
        
        // Handle paginated response
        if (res.data.results !== undefined) {
            return {
                results: res.data.results || [],
                count: res.data.count || 0
            };
        }
        
        // Fallback for non-paginated response
        return {
            results: Array.isArray(res.data) ? res.data : [],
            count: Array.isArray(res.data) ? res.data.length : 0
        };
    } catch (err) {
        console.error(err);
        return { results: [], count: 0 };
    }
};



// RETRIEVE EXPENSE LOG
export const getExpenseLog = async (
    page: number = 1, 
    pageSize: number = 10,
    year?: number, 
    searchQuery?: string, 
    selectedMonth?: string
): Promise<{ results: ExpenseLog[]; count: number }> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (year) params.year = year;
        if (searchQuery) params.search = searchQuery;
        if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
        
        const res = await api.get('treasurer/expense-log/', { params });
        console.log("EXPENSE LOG PO: ", res);
        
        // Handle paginated response
        if (res.data.results !== undefined) {
            return {
                results: res.data.results || [],
                count: res.data.count || 0
            };
        }
        
        // Fallback for non-paginated response
        return {
            results: Array.isArray(res.data) ? res.data : [],
            count: Array.isArray(res.data) ? res.data.length : 0
        };
    } catch (err) {
        console.error(err);
        return { results: [], count: 0 };
    }
};