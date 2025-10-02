import { api } from "@/api/api";


//======================= Resident's End =================

//Retrieve Sitio
export const getSitio = async () => {
    try {
        const res = await api.get('waste/sitio/');
        return res.data;
    } catch (err) {
        console.error(err);
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
        console.error(err);
        throw err; // Important: re-throw the error so React Query can handle it
    }
};



// ==================  Staff's End =======================


//Waste Report Record
export const getWasteReport = async (searchQuery?: string, reportMatter?: string, rp_id?: string) => {
    try {
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (reportMatter && reportMatter !== "0") params.report_matter = reportMatter;
        if (rp_id) params.rp_id = rp_id; // Add rp_id parameter
        
        const res = await api.get('waste/waste-report/', { params });
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
