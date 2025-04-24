// import { useQuery } from "@tanstack/react-query";
// import { getbudgettrackreq } from "../requestAPI/BTGetRequest";

// export type GADBudgetEntry = {
//     gbud_num: number;
//     gbud_date: string;
//     gbud_particulars: string;
//     gbud_type: string;
//     gbud_amount: number;
//     gbud_remaining_bal: number;
//     gbud_add_notes: string;
//     budget_item: number;
//   };

// export const useGetGADBudgets = () => {
//   return useQuery<GADBudgetEntry[], Error>({
//     queryKey: ["gad-budget"],
//     queryFn: () => getbudgettrackreq().catch((error) => {
//         console.error("Error fetching donations:", error);
//         throw error; // Re-throw to let React Query handle the error
//       }),
//     staleTime: 1000 * 60 * 5, // 5 minutes 
//   });
// };

import { useQuery } from "@tanstack/react-query";
import api from "@/pages/api/api";

export type GADBudgetEntry = {
  gbud_num?: number;
  gbud_date: string; 
  gbud_remaining_bal: number;
  gbud_particulars: string;
  gbud_type: string;
  gbud_amount: number;
  gbud_add_notes?: string;
  gbudy_num: number;
  budget_item?: number;  
  gbud_receipt: string;
  year?: string;
  gbudy_budget?: number; 
};

export const useGetGADBudgets = (year?: string) => {
  return useQuery<GADBudgetEntry[]>({
    queryKey: ['gad-budgets', year],
    queryFn: async () => {
      console.log(`Fetching data for year: ${year}`); // Debug
      try {
        const res = await api.get(`/gad/gad-budget-tracker-table/${year}/`);
        console.log('API Response:', res.data); // Debug
        return res.data || [];
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    enabled: !!year,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useGetGADBudgetEntry = (gbud_num: number) => {
  return useQuery<GADBudgetEntry>({
    queryKey: ['gad-budget-entry', gbud_num],
    queryFn: async () => {
      try {
        const res = await api.get(`/gad/gad-budget-tracker-entry/${gbud_num}/`);
        return res.data;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    enabled: !!gbud_num,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};