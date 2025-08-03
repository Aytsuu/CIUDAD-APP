import { useQuery } from "@tanstack/react-query";
import { getGarbagePickupTasks } from "../restful-API/garbagePickupDriverGetAPI";

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

const driver_id = '5'
export const useGetGarbagePickupTasks = () => {
    return useQuery<GarbagePickupTask[]>({
        queryKey: ["garbagePickupTasks", driver_id], 
        queryFn:() => getGarbagePickupTasks(driver_id),
        staleTime: 1000 * 60 * 30,
    });
}
