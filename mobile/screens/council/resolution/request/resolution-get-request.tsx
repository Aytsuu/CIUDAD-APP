import {api} from "@/api/api";
import { ResolutionData } from "../queries/resolution-fetch-queries";


export const getResolution = async (
    page: number = 1, 
    pageSize: number = 10,
    searchQuery?: string, 
    areaFilter?: string, 
    yearFilter?: string,
    isArchive?: boolean
): Promise<{ results: ResolutionData[]; count: number }> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        if (areaFilter && areaFilter !== "all") params.area = areaFilter;
        if (yearFilter && yearFilter !== "all") params.year = yearFilter;
        if (isArchive !== undefined) params.is_archive = isArchive;
        
        const res = await api.get('council/resolution/', { params });
        
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



export const getApprovedProposals = async () => {
    try {

        const res = await api.get('council/approved-proposals/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};