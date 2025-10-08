import { useQuery } from "@tanstack/react-query";
import { getWasteCollectionSchedFull } from "../request/waste-col-get-request";
import { getWasteCollectors } from "../request/waste-col-get-request";
import { getWasteDrivers } from "../request/waste-col-get-request";
import { getWasteTrucks } from "../request/waste-col-get-request";
import { getSitio } from "../request/waste-col-get-request";




export type WasteCollectionSchedFull = {
    wc_num: number;
    wc_day: string;
    wc_time: string;
    wc_add_info: string;
    wc_is_archive: boolean;
    staff: number;
    sitio: string;        // sitio ID
    sitio_name: string;
    truck: string;
    wstp: string;
    collectors: {
        wasc_id: number;
        wstp_id: string;
        name: string;
    }[];
    collectors_wstp_ids: string[];  
    collectors_names: string,
    driver_name: string,
};

export const useGetWasteCollectionSchedFull = (
    page: number = 1,
    pageSize: number = 10,
    searchQuery?: string, 
    selectedDay?: string,
    isArchive?: boolean
) => {
    return useQuery<{ results: WasteCollectionSchedFull[]; count: number }>({
        queryKey: ["wasteCollectionSchedFull", page, pageSize, searchQuery, selectedDay, isArchive],
        queryFn: () => getWasteCollectionSchedFull(page, pageSize, searchQuery, selectedDay, isArchive),
        staleTime: 1000 * 60 * 30,
    });
};



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
    return useQuery<any>({
        queryKey: ["trucks"], 
        queryFn: getWasteTrucks,
        staleTime: 1000 * 60 * 30,
        select: (data) => {
            // Handle both paginated response and direct array
            if (data && data.results) {
                return data.results; // Paginated response
            }
            return data; // Direct array response for non paginated
        }
    });
}




// Retrieve Sitio
export type Sitio = {
    sitio_id: string;
    sitio_name: string;
}

export const useGetWasteSitio = () => {
    return useQuery<Sitio[]>({
        queryKey: ["sitio"], 
        queryFn: getSitio,
        staleTime: 1000 * 60 * 30,
    });
}