
import { useQuery } from "@tanstack/react-query";
import { getFirstAidStocksList,getFirstAidStocksTable } from "../restful-api/FirstAidGetAPI";

  export const useFirstAidStock = () => {
    return useQuery({
      queryKey: ["firstaidstocks"],
      queryFn: getFirstAidStocksList,
      staleTime: 1000 * 60 * 30,
    });
  };

  export const useFirstAidStocksTable = (
    page: number, 
    pageSize: number, 
    search?: string,
    filter?: string
  ) => {
    return useQuery({
      queryKey: ["firstAidStocks", page, pageSize, search, filter],
      queryFn: () => getFirstAidStocksTable(page, pageSize, search, filter),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  