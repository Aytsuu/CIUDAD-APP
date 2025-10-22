import { api } from "@/api/api";

export interface OrdinanceData {
    ord_num: string;
    ord_title: string;
    ord_date_created: string;
    ord_category: string;
    ord_details: string;
    ord_year: number;
    ord_is_archive: boolean;
    ord_repealed?: boolean;
    file?: {
        file_id: number;
        file_url: string;
        file_name?: string;
    };
    staff?: any;
    staff_id?: string;
    ord_parent?: string;
    ord_is_ammend?: boolean;
    ord_ammend_ver?: number;
}

export const getOrdinances = async (
    page: number = 1, 
    pageSize: number = 10,
    searchQuery?: string, 
    categoryFilter?: string, 
    yearFilter?: string,
    isArchive?: boolean
): Promise<{ results: OrdinanceData[]; count: number; total_pages: number }> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        if (categoryFilter && categoryFilter !== "all") params.category = categoryFilter;
        if (yearFilter && yearFilter !== "all") params.year = yearFilter;
        if (isArchive !== undefined) params.is_archive = isArchive;
        
        const res = await api.get('council/ordinance/', { params });
        
        // Handle paginated response
        if (res.data.results !== undefined) {
            return {
                results: res.data.results || [],
                count: res.data.count || 0,
                total_pages: res.data.total_pages || 1
            };
        }
        
        // Fallback for non-paginated response
        return {
            results: Array.isArray(res.data) ? res.data : [],
            count: Array.isArray(res.data) ? res.data.length : 0,
            total_pages: 1
        };
    } catch (err) {
        console.error('Error fetching ordinances:', err);
        return { results: [], count: 0, total_pages: 1 };
    }
};

