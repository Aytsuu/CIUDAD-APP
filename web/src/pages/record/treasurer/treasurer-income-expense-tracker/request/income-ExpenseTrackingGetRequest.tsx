import api from "@/api/api";


export const getIncomeExpense = async () => {
    try {

        const res = await api.get('treasurer/income-expense-tracking/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};