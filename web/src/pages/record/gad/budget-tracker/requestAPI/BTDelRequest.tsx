import { api } from '@/api/api';


export const delbudgettrackreq = async (gbud_num: number) => {
    try {
        console.log("Deleting entry with gbud_num:", gbud_num);
        const res = await api.delete(`/gad/gad-budget-tracker-entry/${gbud_num}/`);
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting entry:", err);
        throw err;
    }
};

