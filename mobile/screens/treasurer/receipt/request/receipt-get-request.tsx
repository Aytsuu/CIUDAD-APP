import {api} from "@/api/api";
import { Receipt } from "../queries/receipt-getQueries";


export const getInvoice = async (
    page: number = 1, 
    pageSize: number = 10,
    searchQuery?: string, 
    natureFilter?: string
): Promise<{ results: Receipt[]; count: number }> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        if (natureFilter && natureFilter !== "all") params.nature = natureFilter;
        
        const res = await api.get('treasurer/invoice/', { params });
        
        // Handle paginated response
        if (res.data.results !== undefined) {
            return {
                results: res.data.results || [],
                count: res.data.count || 0
            };
        }
        
        // Fallback for non-paginated response
        return {
            results: Array.isArray(res.data) ? res.data : [],
            count: Array.isArray(res.data) ? res.data.length : 0
        };
    } catch (err) {
        console.error(err);
        return { results: [], count: 0 };
    }
};