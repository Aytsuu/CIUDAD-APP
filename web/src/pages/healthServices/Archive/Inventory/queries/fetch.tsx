
import { useQuery } from "@tanstack/react-query";
import { getArchivedCommodityStocks,getMedicineInventory ,getAntigenStocks,getFirstAidInventoryList,getCombinedStock} from "../restful-api/getAPI";
export const useAntigenSocks = (
    page: number, 
    pageSize: number, 
    search?: string,
  ) => {
    return useQuery({
      queryKey: ["archiveantigeninventorylist", page, pageSize, search],
      queryFn: () => getAntigenStocks(page, pageSize, search),
      refetchOnMount: true,
      staleTime: 0,
    });
  };



// API hook for fetching archived commodity stocks
export const useArchivedCommodityStocks = (
    page: number, 
    pageSize: number, 
    search?: string,
  ) => {
    return useQuery({
      queryKey: ["archivecommodityinventorylist", page, pageSize, search],
      queryFn: () => getArchivedCommodityStocks(page, pageSize, search),
      refetchOnMount: true,
      staleTime: 0,
    });
  };

  
 export const useMedicineStocks = () => {
    return useQuery({
        queryKey: ["archivemedicineinventorylist"],
        queryFn: getMedicineInventory,
        refetchOnMount: true,
        staleTime: 0,
    });
};

export const useFirstAidList = () => {
    return useQuery({
      queryKey: ["archivefirstaidinventorylist"],
      queryFn: getFirstAidInventoryList,
      staleTime: 1000 * 60 * 30,
    });
  };

  
  export const useAntigenCombineStocks = () => {
      return useQuery({
          queryKey: ["combinedStocks"],
          queryFn: getCombinedStock,
          refetchOnMount: true,
          staleTime: 0,
      });
  };