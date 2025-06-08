import { useQuery } from "@tanstack/react-query";
import { getDrivers } from "../restful-API/GarbageRequestGetAPI";
import { getTrucks } from "../restful-API/GarbageRequestGetAPI";
import { getCollectors } from "../restful-API/GarbageRequestGetAPI";
import { getGarbagePendingRequest, getGarbageRejectedRequest, getGarbageAcceptedRequest, getGarbageCompletedRequest} from "../restful-API/GarbageRequestGetAPI";

// Retrieve Drivers
export type Drivers = {
    id: string;
    firstname: string;
    lastname: string;
}

export const useGetDrivers = () => {
    return useQuery<Drivers[]>({
        queryKey: ["drivers"],
        queryFn: async () => {
            const response = await getDrivers();
            const items = Array.isArray(response) ? response : response?.data || [];
            
            if (!items.length) {
                console.warn("No drivers found in response", response);
                return [];
            }

            return items.map((driver: any) => ({
                id: driver.wstp_id?.toString() || driver.staff?.staff_id?.toString() || '',
                firstname: driver.staff?.rp?.per?.per_fname || 'Unknown',
                lastname: driver.staff?.rp?.per?.per_lname || 'Unknown',
            }));
        },
        staleTime: 1000 * 60 * 30, 
    });
};


// Retrieve Trucks with status Operational
export type Trucks = {
    truck_id: string;
    truck_plate_num: string;
    truck_model: string;
    truck_status: string;
}

export const useGetTrucks = () => {
    return useQuery<Trucks[]>({
        queryKey: ["trucks"], 
        queryFn: getTrucks,
        staleTime: 1000 * 60 * 30,
    });
}


// Retrieve Collectors
export type Collectors = {
    id: string;
    firstname: string;
    lastname: string;
}

export const useGetCollectors = () => {
    return useQuery<Collectors[]>({
        queryKey: ["collectors"],
        queryFn: async () => {
            const response = await getCollectors();
            const items = Array.isArray(response) ? response : response?.data || [];
            
            if (!items.length) {
                console.warn("No drivers found in response", response);
                return [];
            }

            return items.map((collector: any) => ({
                id: collector.wstp_id?.toString() || collector.staff?.staff_id?.toString() || '',
                firstname: collector.staff?.rp?.per?.per_fname || 'Unknown',
                lastname: collector.staff?.rp?.per?.per_lname || 'Unknown',
            }));
        },
        staleTime: 1000 * 60 * 30, 
    });
};

// Retrieve Garbage Pickup Pending Requests
export type GarbageRequestPending = {
    garb_id: string;
    garb_requester: string;
    garb_location: string;
    garb_waste_type: string;
    garb_pref_date: string;
    garb_pref_time: string;
    garb_created_at: string;
    garb_additional_notes: string; 
    file_id: string;
}  

export const useGetGarbagePendingRequest = () => {
    return useQuery<GarbageRequestPending[]>({
        queryKey: ["garbageRequest"],
        queryFn: getGarbagePendingRequest,
        staleTime: 1000 * 60 * 30, 
    });
}

// Retrieve Garbage Pickup Reject Requests
export type GarbageRequestReject = {
    garb_id: string;
    garb_requester: string;
    garb_location: string;
    garb_waste_type: string;
    garb_created_at: string;
    dec_id?: string | null;  
    dec_date?: string | null;
    dec_reason: string;
};


export const useGetGarbageRejectRequest = () => {
    return useQuery<GarbageRequestReject[]>({
        queryKey: ["garbageRejectedRequest"], 
        queryFn: getGarbageRejectedRequest,
        staleTime: 1000 * 60 * 30,
    });
}

export type GarbageRequestAccept = {
  garb_id: string;
  garb_location: string;
  garb_requester: string;
  garb_waste_type: string;
  garb_created_at: string;
  dec_id: string;
  dec_date: string;
}

export const useGetGarbageAcceptRequest = () => {
    return useQuery<GarbageRequestAccept[]>({
        queryKey: ["garbageAcceptedRequest"], 
        queryFn: getGarbageAcceptedRequest,
        staleTime: 1000 * 60 * 30,
    });
}

export type GarbageRequestComplete = {
  garb_id: string;
  garb_location: string;
  garb_requester: string;
  garb_waste_type: string;
  garb_created_at: string;
  conf_resident_conf_date: string | null;  
  conf_resident_conf: boolean | null;     
  conf_staff_conf_date: string | null;    
  conf_staff_conf: boolean | null; 
}

export const useGetGarbageCompleteRequest = () => {
    return useQuery<GarbageRequestComplete[]>({
        queryKey: ["garbageCompletedRequest"], 
        queryFn: getGarbageCompletedRequest,
        staleTime: 1000 * 60 * 30,
    });
}

