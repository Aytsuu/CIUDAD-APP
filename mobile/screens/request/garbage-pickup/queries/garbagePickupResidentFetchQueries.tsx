import { useQuery } from "@tanstack/react-query";
import { getSitio } from "../restful-API/garbagePickupResidentGetAPI";

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