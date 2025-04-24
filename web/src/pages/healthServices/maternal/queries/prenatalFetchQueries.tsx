import { useQuery } from "@tanstack/react-query";
import { getPatients, getSpouse } from "../restful-api/prenatalGetAPI";

export const usePatients = () => {
    return useQuery({
        queryKey: ["patientsData"],
        queryFn: getPatients,
        staleTime: 60 * 30,
    })
}


export const useSpouse = (spouse_id: number | string | null) => {
    return useQuery({
        queryKey: ["spouseData", spouse_id],
        queryFn: () => getSpouse(spouse_id!),
        enabled: !!spouse_id,
        staleTime: 1000 * 60 * 30,
    })
}