import { api } from "@/api/api";


// MAIN CARD FOR INCOME and EXPENSE
export const getIncomeExpenseMainCard = async () => {
    try {

        const res = await api.get('treasurer/income-expense-main/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};


//RETRIEVE EXPENSES
export const getIncomeExpense = async (year?: number) => {
    try {
        const params = year ? { params: { year } } : {};
        const res = await api.get('treasurer/income-expense-tracking/', params);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err; // Important for React Query error handling
    }
};


// RETRIEVE EXPENSE PARTICULARS
export const getParticulars = async (year?: number) => {
    try {
        const params = year ? { params: { year } } : {};
        const res = await api.get('treasurer/get-particular/', params);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};



// ================================== INCOMEEEE =================================


export const getIncomeData = async (year?: number) => {
    try {
        const params = year ? { params: { year } } : {};
        const res = await api.get('treasurer/income-tracking/', params);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};