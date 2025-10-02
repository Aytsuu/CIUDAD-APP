import { useQuery } from "@tanstack/react-query";
import { getbudgetyearreq } from "../request/btracker-getYear";
import { GADBudgetYearEntry } from "../gad-btracker-types";

export const useGetGADYearBudgets = (searchQuery?: string) => {
  return useQuery<GADBudgetYearEntry[], Error>({
    queryKey: ["gad-budget", searchQuery],
    queryFn: () => getbudgetyearreq(searchQuery),
    staleTime: 1000 * 60 * 5,
  });
};