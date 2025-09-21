import { useQuery } from "@tanstack/react-query";
import { getSitio, pendingRequests } from "../restful-API/garbagePickupResidentGetAPI";

export type Sitio = {
    sitio_id: string;
    sitio_name: string;
}

export const useGetSitio = () => {
    return useQuery<Sitio[]>({
        queryKey: ["sitio"],
        queryFn: async () => {
            const response = await getSitio();
            return Array.isArray(response) ? response : response?.data || [];
        },
        staleTime: 1000 * 60 * 30, 
    });
};



const rp_id = '00003250829'
export type GarbageRequestPending = {
    garb_id: string;
    garb_requester: string;
    garb_location: string;
    garb_waste_type: string;
    garb_pref_date: string;
    garb_pref_time: string;
    garb_created_at: string;
    garb_additional_notes: string; 
    file_url: string;
    sitio_name: string;
}  

export const useGetGarbageResidentPending = (rp_id: string) => {
  return useQuery<GarbageRequestPending[]>({
    queryKey: ["garbageRequest", rp_id], 
    queryFn: () => pendingRequests(rp_id), 
    staleTime: 1000 * 60 * 30, 
    enabled: !!rp_id, 
  });
};


