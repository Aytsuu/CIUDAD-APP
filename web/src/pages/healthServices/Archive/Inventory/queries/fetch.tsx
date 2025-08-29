
import { useQuery } from "@tanstack/react-query";
import { getArchivedCommodityStocks,getArchivedMedicineStocks ,getAntigenStocks,getArchivedFirstAidStocks} from "../restful-api/getAPI";
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

// API hook for fetching archived medicine stocks
export const useArchivedMedicineStocks = (
    page: number, 
    pageSize: number, 
    search?: string,
  ) => {
    return useQuery({
      queryKey: ["archivemedicineinventorylist", page, pageSize, search],
      queryFn: () => getArchivedMedicineStocks(page, pageSize, search),
      refetchOnMount: true,
      staleTime: 0,
    });
  };
  

// API hook for fetching archived first aid stocks
export const useArchivedFirstAidStocks = (
    page: number, 
    pageSize: number, 
    search?: string,
  ) => {
    return useQuery({
      queryKey: ["archivefirstaidinventorylist", page, pageSize, search],
      queryFn: () => getArchivedFirstAidStocks(page, pageSize, search),
      refetchOnMount: true,
      staleTime: 0,
    });
  };
  