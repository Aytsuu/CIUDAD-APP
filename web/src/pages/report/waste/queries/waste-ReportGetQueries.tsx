import { useQuery } from "@tanstack/react-query";
import { getWasteReport } from "../request/waste-ReportGetRequest";



export type WasteReport = {
    rep_id: number;
    rep_violator: string;
    rep_add_details: string;
    rep_status: string;
    rep_date: string;
    rep_date_resolved: string;
    rep_image: string; 
};
  
// Retrieving income/expense data
export const useWasteReport = () => {
    return useQuery<WasteReport[]>({
        queryKey: ["wastereport"],
        queryFn: getWasteReport,
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
};
