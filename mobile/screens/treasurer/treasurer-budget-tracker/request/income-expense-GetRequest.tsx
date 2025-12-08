import { api } from "@/api/api";
import { IncomeExpenseCard, IncomeExpense, Income, ExpenseLog} from "../queries/income-expense-FetchQueries";


// MAIN CARD FOR INCOME and EXPENSE
export const getIncomeExpenseMainCard = async (
    page: number = 1, 
    pageSize: number = 10,
    searchQuery?: string
): Promise<any> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        
        const res = await api.get('treasurer/income-expense-main/', { params });
        
        return res.data;
    } catch (_err) {
        return { 
            results: [], 
            count: 0,
            next: null,
            previous: null
        };
    }
};



// RETRIEVE EXPENSES
export const getIncomeExpense = async ( 
    page: number = 1, 
    pageSize: number = 10,
    year?: number,
    searchQuery?: string,
    selectedMonth?: string,
    isArchive?: boolean
): Promise<any> => { // Use `any` or omit type like MOM
    try {
        const params: any = { page, page_size: pageSize };
        
        if (year) params.year = year;
        if (searchQuery) params.search = searchQuery;
        if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
        if (isArchive !== undefined) params.is_archive = isArchive; 
        
        const res = await api.get('treasurer/income-expense-tracking/', { params });
        
        return res.data; 
    } catch (_err) {
        // Return empty structure like your current code
        return { 
            results: [], 
            count: 0,
            next: null,
            previous: null
        };
    }
};


// RETRIEVE EXPENSE PARTICULARS
export const getParticulars = async (year?: number) => {
    try {
        const params = year ? { params: { year } } : {};
        const res = await api.get('treasurer/get-particular/', params);
        return res.data;
    } catch (err) {
        // console.error(err);
        throw err;
    }
};


// RETRIEVE EXPENSE LOG
export const getExpenseLog = async (
    page: number = 1, 
    pageSize: number = 10,
    year?: number, 
    searchQuery?: string, 
    selectedMonth?: string
): Promise<any> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (year) params.year = year;
        if (searchQuery) params.search = searchQuery;
        if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
        
        const res = await api.get('treasurer/expense-log/', { params });
        
        return res.data;
    } catch (_err) {
        return { 
            results: [], 
            count: 0,
            next: null,
            previous: null
        };
    }
};


// ================================== INCOMEEEE =================================



export const getIncomeData = async ( 
    page: number = 1, 
    pageSize: number = 10,
    year?: number,
    searchQuery?: string,
    selectedMonth?: string,
    isArchive?: boolean
): Promise<any> => { // Use `any` like expense
    try {
        const params: any = { page, page_size: pageSize };
        
        if (year) params.year = year;
        if (searchQuery) params.search = searchQuery;
        if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
        if (isArchive !== undefined) params.is_archive = isArchive; 
        
        const res = await api.get('treasurer/income-tracking/', { params });
        
        return res.data; // Just return the raw data like expense
    } catch (_err) {
        // Return empty structure like expense
        return { 
            results: [], 
            count: 0,
            next: null,
            previous: null
        };
    }
};