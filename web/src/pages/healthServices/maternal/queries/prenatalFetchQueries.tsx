import { useQuery } from "@tanstack/react-query";
import { getPatients } from "../restful-api/prenatalGetAPI";

export const usePatients = () => {
    return useQuery({
        queryKey: [""],
        queryFn: getPatients,
        staleTime: 1000 * 60 * 30,
    })
}