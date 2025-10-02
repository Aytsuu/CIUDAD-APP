import { api } from "@/api/api";


export const getWasteReport = async (searchQuery?: string, reportMatter?: string) => {
    try {
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (reportMatter && reportMatter !== "0") params.report_matter = reportMatter;
        
        const res = await api.get('waste/waste-report/', { params });
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};