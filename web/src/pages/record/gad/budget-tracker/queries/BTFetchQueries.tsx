import { useQuery } from "@tanstack/react-query";
import { getbudgettrackreq } from "../requestAPI/BTGetRequest";

export type GADBudgetEntry = {
    gbud_num: number;
    gbud_date: string;
    gbud_particulars: string;
    gbud_type: string;
    gbud_amount: number;
    gbud_remaining_bal: number;
    gbud_add_notes: string;
  };

export const useGetGADBudgets = () => {
  return useQuery<GADBudgetEntry[], Error>({
    queryKey: ["gad-budget"],
    queryFn: () => getbudgettrackreq().catch((error) => {
        console.error("Error fetching donations:", error);
        throw error; // Re-throw to let React Query handle the error
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};