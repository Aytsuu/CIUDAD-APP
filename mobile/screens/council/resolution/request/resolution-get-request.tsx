import {api} from "@/api/api";
import { ResolutionData } from "../queries/resolution-fetch-queries";


export const getResolution = async (
    page: number = 1, 
    pageSize: number = 10,
    searchQuery?: string, 
    areaFilter?: string, 
    yearFilter?: string,
    isArchive?: boolean
): Promise<any> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        if (areaFilter && areaFilter !== "all") params.area = areaFilter;
        if (yearFilter && yearFilter !== "all") params.year = yearFilter;
        if (isArchive !== undefined) params.is_archive = isArchive;
        
        const res = await api.get('council/resolution/', { params });
        
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



export const getApprovedProposals = async () => {
    try {

        const res = await api.get('council/approved-proposals/');
        return res.data;
        
    } catch (_err) {
        // console.error(err);
    }
};