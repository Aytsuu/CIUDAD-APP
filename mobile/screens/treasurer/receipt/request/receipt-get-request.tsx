import {api} from "@/api/api";


export const getInvoice = async (searchQuery?: string, natureFilter?: string) => {
    try {
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (natureFilter && natureFilter !== "all") params.nature = natureFilter;
        
        const res = await api.get('treasurer/invoice/', { params });
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};