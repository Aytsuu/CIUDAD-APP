import { useQuery } from "@tanstack/react-query";
import { getTrucks, getDrivers, getCollectors, getGarbageAcceptedRequest, getGarbageCompletedRequest,
     getGarbagePendingRequest, getGarbageRejectedRequest, getAcceptedDetails, getCompletedDetails, getGarbagePendingRequestDetails, getGarbageRejectedRequestDetails } from "../restful-API/garbagePickupStaffGetAPI";

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
    file_url: string;
    sitio_name: string;
}  

export const useGetGarbagePendingRequest = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results:GarbageRequestPending[], count: number}>({
        queryKey: ["garbageRequest", page, pageSize, searchQuery],
        queryFn:() =>  getGarbagePendingRequest(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
}

export const useGetGarbagePendingRequestDetails = (garb_id: string) => {
    return useQuery<GarbageRequestPending>({
        queryKey: ["garbageRequestDetails", garb_id],
        queryFn:() =>  getGarbagePendingRequestDetails(garb_id),
        staleTime: 1000 * 60 * 30, 
    });
}

export type GarbageRequestReject = {
    garb_id: string;
    garb_requester: string;
    garb_location: string;
    garb_waste_type: string;
    garb_created_at: string;
    garb_pref_time: string;
    garb_pref_date: string;
    garb_additional_notes: string;
    dec_id?: string | null;  
    dec_date?: string | null;
    dec_reason: string;
    file_url: string;
    sitio_name: string;
    staff_name: string;
};


export const useGetGarbageRejectRequest = (page: number, pageSize: number, searchQuery: string) => {
return useQuery<{results: GarbageRequestReject[], count: number}>({
        queryKey: ["garbageRejectedRequest", page, pageSize, searchQuery], 
        queryFn:() => getGarbageRejectedRequest(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30,
    });
}

export const useGetGarbageRejectRequestDetails = (garb_id: string) => {
return useQuery<GarbageRequestReject>({
        queryKey: ["garbageRejectedRequest", garb_id], 
        queryFn:() => getGarbageRejectedRequestDetails(garb_id),
        staleTime: 1000 * 60 * 30,
    });
}

export type GarbageRequestAccept = {
  garb_id: string;
  garb_location: string;
  garb_requester: string;
  garb_waste_type: string;
  garb_created_at: string;
  garb_pref_time: string;
  garb_pref_date: string;
  garb_additional_notes: string; 
  dec_date: string;
  truck_id: string | null;
  driver_id: string | null;
  collector_ids?: string[];
  pickup_assignment_id?: string | null;
  assignment_collector_ids?: string[];
  assignment_info: {
    driver?: string;
    collectors?: string[];
    pick_time?: string;
    pick_date?: string;
    truck?: string;
  } | null;
  sitio_name: string;
  staff_name: string;
};


export const useGetGarbageAcceptRequest = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results:GarbageRequestAccept[], count: number}>({
        queryKey: ["garbageAcceptedRequest", page, pageSize, searchQuery], 
        queryFn:() => getGarbageAcceptedRequest(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30,
    });
}


export type GarbageRequestAcceptDetails = {
  garb_id: string;
  garb_location: string;
  garb_requester: string;
  garb_waste_type: string;
  garb_created_at: string;
  garb_pref_time: string;
  garb_pref_date: string;
  garb_additional_notes: string; 
  dec_date: string;
  truck_id: string | null;
  driver_id: string | null;
  collector_ids?: string[];
  pickup_assignment_id?: string | null;
  assignment_collector_ids?: string[];
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
};


export const useGetViewAccepted = (garb_id: string) => {
    return useQuery<GarbageRequestAcceptDetails | null>({
        queryKey: ["garbageAcceptedRequest", garb_id], 
        queryFn: () => getAcceptedDetails(garb_id),
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}


export type GarbageRequestComplete = {
  garb_id: string;
  garb_location: string;
  garb_requester: string;
  garb_waste_type: string;
  garb_created_at: string;
  garb_pref_time: string;
  garb_pref_date: string;
  garb_additional_notes: string; 
  conf_resident_conf_date: string | null;  
  conf_resident_conf: boolean | null;     
  conf_staff_conf_date: string | null;    
  conf_staff_conf: boolean | null; 
  dec_date: string;
  assignment_info?: {
    driver?: string;
    collectors?: string[];
    pick_time?: string;       
    pick_date?: string;      
    truck?: string;
  } | null;
  sitio_name: string;
  staff_name: string;
}

export const useGetGarbageCompleteRequest = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results:GarbageRequestComplete[], count: number}>({
        queryKey: ["garbageCompletedRequest", page, pageSize, searchQuery], 
        queryFn:() => getGarbageCompletedRequest(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30,
    });
}


export type GarbageRequestCompleteDetails = {
  garb_id: string;
  garb_location: string;
  garb_requester: string;
  garb_waste_type: string;
  garb_created_at: string;
  garb_pref_time: string;
  garb_pref_date: string;
  garb_additional_notes: string; 
  conf_resident_conf_date: string | null;  
  conf_resident_conf: boolean | null;     
  conf_staff_conf_date: string | null;    
  conf_staff_conf: boolean | null; 
  dec_date: string;
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

export const useGetViewCompleted = (garb_id: string) => {
    return useQuery<GarbageRequestCompleteDetails | null>({
        queryKey: ["garbageCompletedRequest", garb_id], 
        queryFn: () => getCompletedDetails(garb_id),
        staleTime: 1000 * 60 * 30, 
    });
}















