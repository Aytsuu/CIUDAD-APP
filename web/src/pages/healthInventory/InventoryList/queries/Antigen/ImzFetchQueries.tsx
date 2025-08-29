import { useQuery } from "@tanstack/react-query";
import { getImzSup } from "../../restful-api/Antigen/fetchAPI";

export const useImmunization = () => {
    return useQuery({
        queryKey: ["immunizationsupplies"],
        queryFn: getImzSup,
        refetchOnMount: true,
        staleTime: 0,
    });
};