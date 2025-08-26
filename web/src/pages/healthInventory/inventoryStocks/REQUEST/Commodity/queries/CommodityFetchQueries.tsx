
import { useQuery } from "@tanstack/react-query";
import { getCommodityStocks,getCommodityStocksTable } from "../restful-api/CommodityGetAPI";

 export const useCommodityStocks = () => {
    return useQuery({
        queryKey: ["commodityinventorylist"],
        queryFn: getCommodityStocks,
        refetchOnMount: true,
        staleTime: 0,
    });
};



  export const useCommodityStocksTable = (
    page: number, 
    pageSize: number, 
    search?: string,
    filter?: string
  ) => {
    return useQuery({
      queryKey: ["commodityStocks", page, pageSize, search, filter],
      queryFn: () => getCommodityStocksTable(page, pageSize, search, filter),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  