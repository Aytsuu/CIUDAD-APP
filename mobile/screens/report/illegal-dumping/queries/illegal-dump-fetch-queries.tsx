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



//======================= Staff's End =================

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
    rep_date: string;
    rep_anonymous: boolean;
    rep_date_resolved: string;
    sitio_id: number;
    sitio_name: string;
    waste_report_file: {
        wrf_id: number;
        wrf_url: string;
    }[];
    waste_report_rslv_file: {
        wrsf_id: number;
        wrsf_url: string;
    }[];
};
  
// Retrieving income/expense data
export const useWasteReport = () => {
    return useQuery<WasteReport[]>({
        queryKey: ["wastereport"],
        queryFn: getWasteReport,
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
};