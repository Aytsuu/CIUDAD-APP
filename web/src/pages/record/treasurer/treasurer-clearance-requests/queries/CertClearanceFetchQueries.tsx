import { useQuery } from "@tanstack/react-query";
import { getResidents } from "../restful-api/permitClearanceGetAPI";


export type Residents = {
    rp_id: string;
    per_id: string;
    last_name: string;
    first_name: string;
    full_name: string;
}

export const useGetResidents = () => {
     return useQuery<Residents[]>({
        queryKey: ["residents"],  
        queryFn: getResidents,
        staleTime: 1000 * 60 * 30, 
    });
}