import { useQuery } from "@tanstack/react-query";
import { getImzSupTables, getImzSuplist } from "../../restful-api/Antigen/antigenFetchAPI";

export const useImzSupTable = (page:number , pageSize: number , search?: string)=> {
    return useQuery({
      queryKey: ["ImzSupplies", page, pageSize, search],
      queryFn: () => getImzSupTables(page, pageSize, search),
      refetchOnMount: true,
      staleTime: 0,
    });
  };

export const useImzSupList = () => {
  return useQuery({
    queryKey: ["ImzSuppliesList"],
    queryFn: getImzSuplist,
    refetchOnMount: true,
    staleTime: 0,
  });
}