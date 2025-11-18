import { useQuery } from "@tanstack/react-query";
import { getGarbagePendingResident, getGarbageRejectedResident, getGarbageAcceptedResident, getGarbageCompletedResident, getGarbageCancelledResident,
    getAcceptedDetailsResident, getCompletedDetailsResident
 } from "../restful-API/garbagePickupGetAPI";

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
    garb_pref_date: string;
    garb_pref_time: string;
    garb_created_at: string;
    garb_additional_notes: string; 
    dec_id?: string | null;  
    dec_date?: string | null;
    dec_reason: string;
    file_url: string;
    sitio_name: string;
    staff_name: string;
};


export const useGetGarbageRejectedResident = (rp_id: string) => {
    return useQuery<GarbageRequestReject[]>({
        queryKey: ["garbageRejectedRequest", rp_id], 
        queryFn:() =>  getGarbageRejectedResident(rp_id),
        staleTime: 1000 * 60 * 30,
        enabled: !!rp_id,
    });
}

export type GarbageRequestAccept = {
  garb_id: string;
  garb_location: string;
  garb_waste_type: string;
  garb_created_at: string;
  garb_additional_notes: string;
  garb_req_status: string;
  garb_requester: string;
  dec_date: string;
  assignment_info?: {
    driver?: string;
    pick_time?: string;
    pick_date?: string;
    truck?: string;
    collectors?: string[]; // Added collectors
  } | null;
  confirmation_info?: {
    conf_resident_conf: boolean;
    conf_resident_conf_date: string | null;
    conf_staff_conf: boolean; // Added
    conf_staff_conf_date: string | null; // Added
  } | null;
  file_url: string;
  sitio_name: string;
  staff_name: string;
};



export const useGetGarbageAcceptedResident = (rp_id: string) => {
    return useQuery<GarbageRequestAccept[]>({
        queryKey: ["garbageAcceptedRequest", rp_id], 
        queryFn:() => getGarbageAcceptedResident(rp_id),
        staleTime: 1000 * 60 * 30,
        enabled: !!rp_id,
    });
}

export const useGetAcceptedDetailsResident = (garb_id: string) => {
    return useQuery<GarbageRequestAccept | null>({
        queryKey: ["garbageAcceptedRequest", garb_id], 
        queryFn: () => getAcceptedDetailsResident(garb_id),
        staleTime: 1000 * 60 * 30, 
        enabled: !!garb_id,
    });
}



export type GarbageRequestComplete = {
  garb_id: string;
  garb_location: string;
  garb_waste_type: string;
  garb_created_at: string;
  conf_resident_conf_date: string | null;  
  conf_resident_conf: boolean | null;     
  conf_staff_conf_date: string | null;    
  conf_staff_conf: boolean | null;
  garb_additional_notes?: string; 
  assignment_info?: {
    driver?: string;
    collectors?: string[];
    pick_time?: string;       
    pick_date?: string;      
    truck?: string;
  } | null;
  file_url: string;
  sitio_name: string;
  staff_name: string;
}

export const useGetGarbageCompleteResident = (rp_id: string) => {
    return useQuery<GarbageRequestComplete[]>({
        queryKey: ["garbageCompletedRequest", rp_id], 
        queryFn:() => getGarbageCompletedResident(rp_id), 
        staleTime: 1000 * 60 * 30,
        enabled: !!rp_id,
    });
}

export const useGetCompletedDetailsResident = (garb_id: string) => {
    return useQuery<GarbageRequestComplete | null>({
        queryKey: ["garbageCompletedRequest", garb_id], 
        queryFn: () => getCompletedDetailsResident(garb_id),
        staleTime: 1000 * 60 * 30, 
    });
}

export type GarbageRequestCancelled = {
    garb_id: string;
    garb_requester: string;
    garb_location: string;
    garb_waste_type: string;
    garb_pref_date: string;
    garb_pref_time: string;
    garb_created_at: string;
    garb_additional_notes: string; 
    dec_id?: string | null;  
    dec_date?: string | null;
    dec_reason: string;
    file_url: string;
    sitio_name: string;
};


export const useGetGarbageCancelledResident = (rp_id: string) => {
    return useQuery<GarbageRequestCancelled[]>({
        queryKey: ["garbageCancelledRequest", rp_id], 
        queryFn:() =>  getGarbageCancelledResident(rp_id),
        staleTime: 1000 * 60 * 30,
        enabled: !!rp_id,
    });
}