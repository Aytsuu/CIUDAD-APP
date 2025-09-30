import { useQuery } from "@tanstack/react-query";
import { getbudgetyearreq } from "../requestAPI/BTYearReq";
import { GADBudgetYearEntry } from "../budget-tracker-types";

export const useGetGADYearBudgets = (searchQuery?: string) => {
  return useQuery<GADBudgetYearEntry[], Error>({
    queryKey: ["gad-budget", searchQuery],
    queryFn: () => getbudgetyearreq(searchQuery),
    staleTime: 1000 * 60 * 5,
  });
};