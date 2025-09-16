import { api } from "@/api/api";


export const getWasteReport = async () => {
    try {

        const res = await api.get('waste/waste-report/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};