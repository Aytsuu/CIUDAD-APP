import {api} from "@/api/api";
import { Receipt } from "../queries/receipt-getQueries";


export const getInvoice = async (
    page: number = 1, 
    pageSize: number = 10,
    searchQuery?: string, 
    natureFilter?: string
): Promise<any> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        if (natureFilter && natureFilter !== "all") params.nature = natureFilter;
        
        const res = await api.get('treasurer/invoice/', { params });
        
        return res.data;
    } catch (_err) {
        return { 
            results: [], 
            count: 0,
            next: null,
            previous: null
        };
    }
};