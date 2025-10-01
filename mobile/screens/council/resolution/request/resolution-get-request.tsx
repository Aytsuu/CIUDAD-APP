import {api} from "@/api/api";


export const getResolution = async (searchQuery?: string, areaFilter?: string, yearFilter?: string) => {
    try {
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (areaFilter && areaFilter !== "all") params.area = areaFilter;
        if (yearFilter && yearFilter !== "all") params.year = yearFilter;
        
        const res = await api.get('council/resolution/', { params });
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
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