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
        return res.data;
    } catch (err) {
        console.error(err);
        throw err; // Important for React Query error handling
    }
};



// export const getIncomeData = async () => {
//     try {

//         const res = await api.get('treasurer/income-tracking/');
//         return res.data;
        
//     } catch (err) {
//         console.error(err);
//     }
// };

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