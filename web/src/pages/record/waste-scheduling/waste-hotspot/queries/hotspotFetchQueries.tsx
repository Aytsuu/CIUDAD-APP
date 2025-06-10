import { useQuery } from "@tanstack/react-query";
import { getWatchman } from "../restful-API/hotspotGetAPI";
import { getSitio } from "../restful-API/hotspotGetAPI";

export type Watchman = {
    id: string;
    firstname: string;
    lastname: string;
}

export const useGetWatchman = () => {
    return useQuery<Watchman[]>({
        queryKey: ["watchmen"],
        queryFn: async () => {
            const response = await getWatchman();
            const items = Array.isArray(response) ? response : response?.data || [];
            
            if (!items.length) {
                console.warn("No drivers found in response", response);
                return [];
            }

            return items.map((watchman: any) => ({
                id: watchman.wstp_id?.toString() || watchman.staff?.staff_id?.toString() || '',
                firstname: watchman.staff?.rp?.per?.per_fname || 'Unknown',
                lastname: watchman.staff?.rp?.per?.per_lname || 'Unknown',
            }));
        },
        staleTime: 1000 * 60 * 30, 
    });
};

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


