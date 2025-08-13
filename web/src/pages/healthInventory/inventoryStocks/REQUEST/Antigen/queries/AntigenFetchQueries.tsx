
import { useQuery } from "@tanstack/react-query";
import { getCombinedStock } from "../restful-api/AntigenGetAPI";

export const useAntigenCombineStocks = () => {
    return useQuery({
        queryKey: ["combinedStocks"],
        queryFn: getCombinedStock,
        refetchOnMount: true,
        staleTime: 0,
    });
};