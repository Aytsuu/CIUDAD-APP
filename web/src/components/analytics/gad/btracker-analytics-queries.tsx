import { useQuery } from "@tanstack/react-query";
import type { GADBudgetEntry, GADBudgetEntryUI, GADBudgetYearEntry } from "@/pages/record/gad/budget-tracker/budget-tracker-types";
import {  fetchGADBudgets } from "@/pages/record/gad/budget-tracker/requestAPI/BTGetRequest";
import { getbudgetyearreq } from "@/pages/record/gad/budget-tracker/requestAPI/BTYearReq";
import type { GADBudgetEntryUI } from "@/pages/record/gad/budget-tracker/budget-tracker-types";
import { GADBudgetEntry } from "@/pages/record/gad/budget-tracker/budget-tracker-types";

const transformBudgetEntry = (entry: GADBudgetEntry): GADBudgetEntryUI => {
  return {
    ...entry,
    gbud_particulars: entry.gbud_exp_particulars || undefined,
    gbud_amount: entry.gbud_actual_expense != null && entry.gbud_actual_expense !== 0
        ? Number(entry.gbud_actual_expense)
        : entry.gbud_proposed_budget ? Number(entry.gbud_proposed_budget) : null,
    gbud_exp_particulars: entry.gbud_exp_particulars,
    files: entry.files || undefined
  };
};

export const useLatestExpenses = (year: string) => {
  return useQuery<GADBudgetEntry[], Error, GADBudgetEntryUI[]>({
    queryKey: ['latest-expenses', year],
    queryFn: () => fetchGADBudgets(year),
    select: (data) => data
      .sort((a, b) => new Date(b.gbud_datetime).getTime() - new Date(a.gbud_datetime).getTime())
      .slice(0, 5)
      .map(transformBudgetEntry),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

const QUARTERS = [
  { name: "Jan-Mar", months: ["Jan", "Feb", "Mar"] },
  { name: "Apr-Jun", months: ["Apr", "May", "Jun"] },
  { name: "Jul-Sep", months: ["Jul", "Aug", "Sep"] },
  { name: "Oct-Dec", months: ["Oct", "Nov", "Dec"] }
];

interface QuarterlyBudgetData {
  name: string;
  expense: number;
  net: number;
}

export const useQuarterlyBudget = (year: string) => {
  return useQuery<GADBudgetEntry[], Error, QuarterlyBudgetData[]>({
    queryKey: ['quarterly-budget', year],
    queryFn: () => fetchGADBudgets(year),
    select: (data) => {
      // Debug raw amounts
      console.log("Raw Amount Verification:", data.map(entry => ({
        id: entry.gbud_num,
        amount: entry.gbud_actual_expense
      })));

      return QUARTERS.map((quarter) => {
        const result = {
          name: quarter.name,
          expense: 0,
          net: 0
        };

        data.forEach(entry => {
          const month = new Date(entry.gbud_datetime).toLocaleString('default', { month: 'short' });
          if (quarter.months.includes(month)) {

              const amount = entry.gbud_actual_expense !== null 
                ? Number(entry.gbud_actual_expense)
                : 0;
              result.expense += amount;
            }       
        });
        return result;
      });
    },
    staleTime: 1000 * 60 * 5
  });
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