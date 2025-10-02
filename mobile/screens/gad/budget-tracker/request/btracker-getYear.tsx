import { api } from "@/api/api";

export const getbudgetyearreq = async (searchQuery?: string) => {
    try {
        const params: any = {};
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        const res = await api.get('gad/gad-budget-tracker-main/', { params });
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        return []; 
    }
};