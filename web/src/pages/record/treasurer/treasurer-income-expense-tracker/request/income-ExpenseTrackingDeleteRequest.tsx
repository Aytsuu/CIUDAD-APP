import api from "@/api/api";


export const deleteIncomeExpense = async (iet_num: number) => {
    try {
        const res = await api.delete(`treasurer/income-expense-tracking/${iet_num}/`);
        console.log("IETNUM: ", iet_num)
        return res.data; // Return the response data if needed
    } catch (err) {
        console.error("IETNUM: ", iet_num)
        console.error("Error deleting entry:", err);
        throw err; // Rethrow the error to handle it in the component
    }
};


