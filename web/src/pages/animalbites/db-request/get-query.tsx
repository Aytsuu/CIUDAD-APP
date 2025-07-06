import { useQuery } from "@tanstack/react-query"
import { getAnimalbitePatients } from "../api/get-api"


export const usePatients = () => {
    return useQuery({
        queryKey: ["patientsData"],
        queryFn: getAnimalbitePatients,
        staleTime: 1000 * 60 * 30
    })
}