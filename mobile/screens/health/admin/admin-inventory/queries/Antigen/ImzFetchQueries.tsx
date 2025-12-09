import { useQuery } from "@tanstack/react-query";
import { getImzSupTables, getImzSuplist } from "../../restful-api/Antigen/antigenFetchAPI";

export const useImzSupTable = (page:number , pageSize: number , search?: string)=> {
    return useQuery({
      queryKey: ["ImzSupplies", page, pageSize, search],
      queryFn: () => getImzSupTables(page, pageSize, search),
      refetchOnMount: true,
       staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background
    });
  };

export const useImzSupList = () => {
  return useQuery({
    queryKey: ["ImzSuppliesList"],
    queryFn: getImzSuplist,
    refetchOnMount: true,
 staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background
  });
}