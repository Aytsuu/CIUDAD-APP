import { useQuery } from "@tanstack/react-query";
import { getCommodity } from "../../restful-api/commodity/CommodityFetchAPI";

export const useCommodities = () => {
    return useQuery({
        queryKey: ["commodities"],
        queryFn: getCommodity,
        refetchOnMount: true,
        staleTime: 0,
    });
};