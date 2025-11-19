import { useQuery } from "@tanstack/react-query";
import { getSitio } from "../request/illegal-dump-get-request";
import { getWasteReport } from "../request/illegal-dump-get-request";

//======================= Resident's End =================


// Retrieve Sitio
export type Sitio = {
    sitio_id: string;
    sitio_name: string;
}

export const useGetWasteSitio = () => {
    return useQuery<Sitio[]>({
        queryKey: ["sitio"], 
        queryFn: getSitio,
        staleTime: 1000 * 60 * 30,
    });
}



//======================= Both Resident & Staff =================

export type WasteReport = {
    rep_id: number;
    // rep_image: string;
    rep_matter: string;
    rep_location: string;
    rep_add_details: string;
    rep_violator: string;
    rep_complainant: string;
    rep_contact: string;
    rep_status: string;
    rep_cancel_reason: string;
    rep_date: string;
    rep_anonymous: boolean;
    rep_date_resolved: string;
    rep_date_cancelled: string;
    sitio_id: number;
    sitio_name: string;
    waste_report_file: {
        wrf_id: number;
        wrf_name: string;
        wrf_url: string;
        wrf_type: string;
    }[];
    waste_report_rslv_file: {
        wrsf_id: number;
        wrsf_url: string;
        wrsf_type: string;
    }[];
};
  
// Retrieving Waste reports for staff
export const useWasteReport = (
    page: number = 1,
    pageSize: number = 10,
    searchQuery?: string,
    reportMatter?: string,
    status?: string,
    rp_id?: string,
    rep_id?: string 
) => {
    return useQuery<{ results: WasteReport[]; count: number }>({
        queryKey: ["wastereport", page, pageSize, searchQuery, reportMatter, status, rp_id, rep_id],
        queryFn: () => getWasteReport(page, pageSize, searchQuery, reportMatter, status, rp_id, rep_id),
        staleTime: 1000 * 60 * 30,
    });
};