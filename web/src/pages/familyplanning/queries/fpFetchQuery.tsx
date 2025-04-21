import { useQuery } from "@tanstack/react-query";
import { getFP } from "../request-db/GetRequest";   

export const useFPRecord = () => {
    return useQuery({
        queryKey: ["fp"],
        queryFn: getFP,
        staleTime: 60*30
    });
    };