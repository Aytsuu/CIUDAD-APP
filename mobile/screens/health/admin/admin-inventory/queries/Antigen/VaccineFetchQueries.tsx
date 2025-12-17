import { useQuery } from "@tanstack/react-query";
import { getVaccineListCombine } from "../../restful-api/Antigen/antigenFetchAPI";

export const useAntigen = (page:number , pageSize: number , search?: string) => {
  return useQuery({
    queryKey: ["VaccineListCombine", page, pageSize, search],
    queryFn: () => getVaccineListCombine(page, pageSize, search),
    refetchOnMount: true,
     staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background
  });
};