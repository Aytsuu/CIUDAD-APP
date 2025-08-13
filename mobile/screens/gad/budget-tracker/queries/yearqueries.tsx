import { useQuery } from "@tanstack/react-query";
import { getbudgetyearreq } from "../request/getYear";
import { GADBudgetYearEntry } from "../bt-types";

export const useGetGADYearBudgets = () => {
  return useQuery<GADBudgetYearEntry[], Error>({
    queryKey: ["gad-budget"],
    queryFn: () => getbudgetyearreq().catch((error) => {
        throw error; // Re-throw to let React Query handle the error
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};