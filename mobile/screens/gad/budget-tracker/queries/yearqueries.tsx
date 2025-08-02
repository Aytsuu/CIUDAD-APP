import { useQuery } from "@tanstack/react-query";
import { getbudgetyearreq } from "../request/getYear";

export type GADBudgetYearEntry = {
    gbudy_num: number;
    gbudy_year: string;
    gbudy_budget: number;
    gbudy_expenses: number;
    gbudy_income: number;
    gbudy_is_archive?: boolean; 
  };

export const useGetGADYearBudgets = () => {
  return useQuery<GADBudgetYearEntry[], Error>({
    queryKey: ["gad-budget"],
    queryFn: () => getbudgetyearreq().catch((error) => {
        console.error("Error fetching donations:", error);
        throw error; // Re-throw to let React Query handle the error
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};