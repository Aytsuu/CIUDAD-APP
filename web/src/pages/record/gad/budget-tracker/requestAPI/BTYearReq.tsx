import { api } from "@/api/api";

export const getbudgetyearreq = async () => {
    try {
        const res = await api.get('gad/gad-budget-tracker-main/');
        const data = res.data?.data ?? res.data ?? [];
        const filteredData = Array.isArray(data) 
            ? data.filter(item => item.gbudy_is_archive === false) 
            : [];
        return filteredData;
    } catch (err) {
        return [];  // Always return an array
    }
};