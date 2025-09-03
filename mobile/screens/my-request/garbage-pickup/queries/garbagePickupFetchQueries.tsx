import { useQuery } from "@tanstack/react-query";
import { getGarbagePendingResident } from "../restful-API/garbagePickupGetAPI";

export type GarbageRequestPending = {
    garb_id: string;
    garb_location: string;
    garb_waste_type: string;
    garb_pref_date: string;
    garb_pref_time: string;
    garb_created_at: string;
    garb_additional_notes: string; 
    file_url: string;
    sitio_name: string;
}  

export const useGetGarbagePendingResident = (rp_id: string) => {
    return useQuery<GarbageRequestPending[]>({
        queryKey: ["garbageRequest", rp_id],
        queryFn: () => getGarbagePendingResident(rp_id),
        enabled: !!rp_id,
    });
}