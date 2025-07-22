import { api } from "@/api/api";


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


export const getExpenseParticulars = async (year?: number) => {
    try {
        const params = year ? { params: { year } } : {};
        const res = await api.get('treasurer/get-expense_particular/', params);
        console.log("REQ EXPENSE PARTICULAR: ", res)
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};



export const getIncomeParticulars = async () => {

    try {
        const res = await api.get('treasurer/income-particular/');
        return res.data;

    } catch (err) {
        console.error(err);
    }
};