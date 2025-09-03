import { useQuery } from "@tanstack/react-query";
import { getGarbagePendingResident, getGarbageRejectedResident } from "../restful-API/garbagePickupGetAPI";

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
        staleTime: 1000 * 60 * 30,
        enabled: !!rp_id,
    });
}

export type GarbageRequestReject = {
    garb_id: string;
    garb_requester: string;
    garb_location: string;
    garb_waste_type: string;
    garb_created_at: string;
    dec_id?: string | null;  
    dec_date?: string | null;
    dec_reason: string;
    file_url: string;
    sitio_name: string;
};


export const useGetGarbageRejectedResident = (rp_id: string) => {
    return useQuery<GarbageRequestReject[]>({
        queryKey: ["garbageRejectedRequest", rp_id], 
        queryFn:() =>  getGarbageRejectedResident(rp_id),
        staleTime: 1000 * 60 * 30,
        enabled: !!rp_id,
    });
}
