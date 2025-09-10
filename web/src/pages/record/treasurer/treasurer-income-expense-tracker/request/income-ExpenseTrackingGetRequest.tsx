import {api} from "@/api/api";


// export const getIncomeExpense = async () => {
//     try {

//         const res = await api.get('treasurer/income-expense-tracking/');
//         return res.data;
        
//     } catch (err) {
//         console.error(err);
//     }
// };

export const getIncomeExpense = async (year?: number) => {
    try {
        const params = year ? { params: { year } } : {};
        const res = await api.get('treasurer/income-expense-tracking/', params);
        console.log("EXPENSE W/ URL: ", res)
        return res.data;
    } catch (err) {
        console.error(err);
        throw err; // Important for React Query error handling
    }
};




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




export const getIncomeExpenseMainCard = async () => {
    try {

        const res = await api.get('treasurer/income-expense-main/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};



// RETRIEVE EXPENSE LOG
export const getExpenseLog = async (year?: number) => {
    try {
        const params = year ? { params: { year } } : {};
        const res = await api.get('treasurer/expense-log/', params);
        console.log("EXPENSE LOG PO: ", res)
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};