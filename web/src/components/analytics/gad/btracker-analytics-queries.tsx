import { useQuery } from "@tanstack/react-query";
import type { GADBudgetEntry, GADBudgetEntryUI} from "@/pages/record/gad/budget-tracker/budget-tracker-types";
import {  fetchGADBudgets } from "@/pages/record/gad/budget-tracker/requestAPI/BTGetRequest";
import { getbudgetyearreq } from "@/pages/record/gad/budget-tracker/requestAPI/BTYearReq";

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
  return useQuery({
    queryKey: ['latest-expenses', year],
    queryFn: () => fetchGADBudgets(year, 1, 1000), // Get all records for analytics
    select: (data) => data.results
      .sort((a, b) => new Date(b.gbud_datetime).getTime() - new Date(a.gbud_datetime).getTime())
      .slice(0, 5)
      .map(transformBudgetEntry),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

const QUARTERS = [
  { name: "Jan-Mar", months: [0, 1, 2] }, 
  { name: "Apr-Jun", months: [3, 4, 5] },
  { name: "Jul-Sep", months: [6, 7, 8] },
  { name: "Oct-Dec", months: [9, 10, 11] }
];

export const useQuarterlyBudget = (year: string) => {
  return useQuery({
    queryKey: ['quarterly-budget', year],
    queryFn: () => fetchGADBudgets(year, 1, 1000), 
    select: (data) => {
      return QUARTERS.map((quarter) => {
        const result = {
          name: quarter.name,
          expense: 0,
          net: 0
        };

        data.results.forEach(entry => {
        const entryDate = new Date(entry.gbud_datetime);
        const month = entryDate.getMonth(); 
        
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
  return useQuery({
    queryKey: ["gad-budget"],
    queryFn: () => getbudgetyearreq().catch((error) => {
        throw error;
      }),
    select: (data) => data.results, 
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// New hook for GAD analytics cards
export const useGADBudgetAnalytics = (year: string) => {
  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['gad-budget-analytics', year],
    queryFn: () => fetchGADBudgets(year, 1, 1000), // Get all records
    select: (data) => {
      const entries = data.results;
      const totalExpenses = entries.reduce((sum, entry) => {
        const amount = entry.gbud_actual_expense !== null 
          ? Number(entry.gbud_actual_expense)
          : 0;
        return sum + amount;
      }, 0);
      
      const totalBudget = entries.reduce((sum, entry) => {
        const amount = entry.gbud_proposed_budget !== null
          ? Number(entry.gbud_proposed_budget)
          : 0;
        return sum + amount;
      }, 0);

      const remainingBudget = totalBudget - totalExpenses;

      return {
        totalExpenses,
        totalBudget,
        remainingBudget,
        entryCount: data.count
      };
    },
    staleTime: 1000 * 60 * 5
  });

  return {
    data: budgetData,
    isLoading
  };
};