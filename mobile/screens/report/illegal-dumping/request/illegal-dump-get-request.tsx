import { api } from "@/api/api";
import { WasteReport } from "../queries/illegal-dump-fetch-queries";

//======================= Resident's End =================

//Retrieve Sitio
export const getSitio = async () => {
    try {
        const res = await api.get('waste/sitio/');
        return res.data;
    } catch (err) {
        // console.error(err);
        throw err;
    }
}

//Waste Report Record for resident
export const getWasteResReport = async (rp_id?: string) => {
    try {
        // Correct way to pass query parameters
        const config = rp_id ? { params: { rp_id } } : {};
        const res = await api.get('waste/waste-report/', config);
        return res.data;
    } catch (err) {
        // console.error(err);
        throw err; // Important: re-throw the error so React Query can handle it
    }
};



// ==================  Staff's End =======================


//Waste Report Record
export const getWasteReport = async (
    page: number = 1,
    pageSize: number = 10,
    searchQuery?: string,
    reportMatter?: string,
    status?: string,
    rp_id?: string,
    rep_id?: string 
): Promise<any> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        if (reportMatter && reportMatter !== "0") params.report_matter = reportMatter;
        if (status) params.status = status;
        if (rp_id) params.rp_id = rp_id;
        if (rep_id) params.rep_id = rep_id;
        
        const res = await api.get('waste/waste-report/', { params });
        
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