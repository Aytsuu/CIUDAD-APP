import { useQuery } from "@tanstack/react-query";
import { getbudgetyearreq } from "../requestAPI/BTYearReq";

export const useGetGADYearBudgets = (page: number = 1, pageSize: number = 10, searchQuery?: string) => {
  return useQuery({
    queryKey: ["gad-budget", searchQuery, page, pageSize],
    queryFn: () => getbudgetyearreq(page, pageSize, searchQuery),
    staleTime: 1000 * 60 * 5,
  });
};