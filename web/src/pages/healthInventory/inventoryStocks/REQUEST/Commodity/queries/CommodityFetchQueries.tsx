
import { useQuery } from "@tanstack/react-query";
import { getCommodityStocks } from "../restful-api/CommodityGetAPI";

 export const useCommodityStocks = () => {
    return useQuery({
        queryKey: ["commodityinventorylist"],
        queryFn: getCommodityStocks,
        refetchOnMount: true,
        staleTime: 0,
    });
};