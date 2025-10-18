import { useQuery } from "@tanstack/react-query";
import { getFirstAidStocksTable } from "../restful-api/FirstAidGetAPI";

export const useFirstAidStocksTable = (page: number, pageSize: number, search?: string, filter?: string) => {
  return useQuery({
    queryKey: ["firstAidStocks", page, pageSize, search, filter],
    queryFn: () => getFirstAidStocksTable(page, pageSize, search, filter),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};
