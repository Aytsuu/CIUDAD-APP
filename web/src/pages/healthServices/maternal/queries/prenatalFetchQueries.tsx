import { useQuery } from "@tanstack/react-query";
import { getPatients} from "../restful-api/prenatalGetAPI";

export const usePatients = () => {
    return useQuery({
        queryKey: ["patientsData"],
        queryFn: getPatients,
        staleTime: 60 * 30,
        retry: 2
    })
}
