import { useQuery } from "@tanstack/react-query";
import { getDrivers } from "../restful-API/GarbageRequestGetAPI";
import { getTrucks } from "../restful-API/GarbageRequestGetAPI";
import { getCollectors } from "../restful-API/GarbageRequestGetAPI";

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