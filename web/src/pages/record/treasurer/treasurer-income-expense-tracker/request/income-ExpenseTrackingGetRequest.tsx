import {api} from "@/api/api";


export const getIncomeExpense = async () => {
    try {

        const res = await api.get('treasurer/income-expense-tracking/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};



export const getIncomeData = async () => {
    try {

        const res = await api.get('treasurer/income-tracking/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};