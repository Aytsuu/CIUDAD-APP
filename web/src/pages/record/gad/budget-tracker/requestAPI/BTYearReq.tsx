import { api } from "@/api/api";

export const getbudgetyearreq = async (page: number = 1, pageSize: number = 10, searchQuery?: string) => {
    try {
        const params: any = {
            page,
            page_size: pageSize
        };
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        const res = await api.get('gad/gad-budget-tracker-main/', { params });
        
        // Always return the same structure
        if (res.data && typeof res.data === 'object') {
            // If it's already the paginated response structure
            if (res.data.results !== undefined) {
                return {
                    results: res.data.results || [],
                    count: res.data.count || 0,
                    next: res.data.next || null,
                    previous: res.data.previous || null
                };
            }
            // If it's just an array, wrap it in paginated format
            else if (Array.isArray(res.data)) {
                return {
                    results: res.data,
                    count: res.data.length,
                    next: null,
                    previous: null
                };
            }
        }
        
        // Fallback if no data
        return {
            results: [],
            count: 0,
            next: null,
            previous: null
        };
    } catch (err) {
        // console.error('Error fetching budget years:', err);
        return {
            results: [],
            count: 0,
            next: null,
            previous: null
        };
    }
};