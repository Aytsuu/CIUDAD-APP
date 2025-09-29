import {api} from "@/api/api";



export const getIncomeExpense = async (year?: number, searchQuery?: string, selectedMonth?: string) => {
    try {
        const params: any = {};
        if (year) params.year = year;
        if (searchQuery) params.search = searchQuery;
        if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
        
        const res = await api.get('treasurer/income-expense-tracking/', { params });
        console.log("EXPENSE W/ URL: ", res)
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
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