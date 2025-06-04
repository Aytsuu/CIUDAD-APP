import { api } from "@/api/api";


export const deleteWasteReport = async (rep_id: number) => {
    try {
        console.log("REP_ID: ", rep_id)
        const res = await api.delete(`waste/delete-waste-report/${rep_id}/`);
        return res.data; 
    } catch (err) {
        console.error("REP_ID: ", rep_id)
        console.error("Error deleting report:", err);
        throw err; // Rethrow the error to handle it in the component
    }
};