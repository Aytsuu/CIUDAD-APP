import { useQuery } from "@tanstack/react-query";
import { getWasteCollectors } from "../request/wasteColGetRequest";
import { getWasteDrivers } from "../request/wasteColGetRequest";
import { getWasteTrucks } from "../request/wasteColGetRequest";


// Retrieve Waste Collectors
export type WasteCollectors = {
    id: string;
    firstname: string;
    lastname: string;
}

export const useGetWasteCollectors = () => {
    return useQuery<WasteCollectors[]>({
        queryKey: ["Wastecollectors"],
        queryFn: async () => {
            const response = await getWasteCollectors();
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



// Retrieve Drivers
export type WasteDrivers = {
    id: string;
    firstname: string;
    lastname: string;
}

export const useGetWasteDrivers = () => {
    return useQuery<WasteDrivers[]>({
        queryKey: ["drivers"],
        queryFn: async () => {
            const response = await getWasteDrivers();
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



// Retrieve Trucks
export type Trucks = {
    truck_id: string;
    truck_plate_num: string;
    truck_model: string;
    truck_status: string;
}

export const useGetWasteTrucks = () => {
    return useQuery<Trucks[]>({
        queryKey: ["trucks"], 
        queryFn: getWasteTrucks,
        staleTime: 1000 * 60 * 30,
    });
}
