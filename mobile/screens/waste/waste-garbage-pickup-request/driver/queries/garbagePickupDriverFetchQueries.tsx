import { useQuery } from "@tanstack/react-query";
import { getGarbagePickupTasks, getGarbageCompletedTasks } from "../restful-API/garbagePickupDriverGetAPI";

export type GarbagePickupTask = {
    garb_id: string;
    garb_location: string;
    garb_requester: string;
    garb_waste_type: string;
    garb_created_at: string;
    dec_date: string;
    assignment_info?: {
        collectors?: string[];
        pick_time?: string;
        pick_date?: string;
        truck?: string;
    } | null;
    file_url: string;
    sitio_name: string;
}

const driver_id = '1'
export const useGetGarbagePickupTasks = () => {
    return useQuery<GarbagePickupTask[]>({
        queryKey: ["garbagePickupTasks", driver_id], 
        queryFn:() => getGarbagePickupTasks(driver_id),
        staleTime: 1000 * 60 * 30,
    });
}

export type GarbageCompletedTasks = {
  garb_id: string;
  garb_location: string;
  garb_requester: string;
  garb_waste_type: string;
  conf_resident_conf_date: string | null;  
  conf_resident_conf: boolean | null;     
  conf_staff_conf_date: string | null;    
  conf_staff_conf: boolean | null; 
  assignment_info?: {
    collectors?: string[];
    pick_time?: string;       
    pick_date?: string;      
    truck?: string;
  } | null;
  file_url: string;
  sitio_name: string;
}

export const useGetGarbageCompletedTasks = () => {
    return useQuery<GarbageCompletedTasks[]>({
        queryKey: ["garbageCompletedRequest", driver_id], 
        queryFn: () => getGarbageCompletedTasks(driver_id),
        staleTime: 1000 * 60 * 30,
    });
}
