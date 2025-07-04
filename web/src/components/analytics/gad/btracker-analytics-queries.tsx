import { useQuery } from "@tanstack/react-query";
import type { GADBudgetEntryUI } from "@/pages/record/gad/budget-tracker/queries/BTFetchQueries";
import { GADBudgetEntry, fetchGADBudgets } from "@/pages/record/gad/budget-tracker/requestAPI/BTGetRequest";

const transformBudgetEntry = (entry: GADBudgetEntry): GADBudgetEntryUI => {
  return {
    ...entry,
    gbud_particulars: entry.gbud_type === 'Income' 
      ? entry.gbud_inc_particulars || null
      : entry.gbud_exp_particulars || null,
    gbud_amount: entry.gbud_type === 'Income'
      ? entry.gbud_inc_amt ? Number(entry.gbud_inc_amt) : null
    //   : entry.gbud_actual_expense ? Number(entry.gbud_actual_expense) : null
    : entry.gbud_actual_expense != null && entry.gbud_actual_expense !== 0
        ? Number(entry.gbud_actual_expense)
        : entry.gbud_proposed_budget ? Number(entry.gbud_proposed_budget) : null
  };
};

export const useLatestExpenses = (year: string) => {
  return useQuery<GADBudgetEntry[], Error, GADBudgetEntryUI[]>({
    queryKey: ['latest-expenses', year],
    queryFn: () => fetchGADBudgets(year),
    select: (data) => data
      .filter((entry): entry is GADBudgetEntry => entry.gbud_type === 'Expense')
      .sort((a, b) => new Date(b.gbud_datetime).getTime() - new Date(a.gbud_datetime).getTime())
      .slice(0, 5)
      .map(transformBudgetEntry),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

export const useLatestIncomes = (year: string) => {
  return useQuery<GADBudgetEntry[], Error, GADBudgetEntryUI[]>({
    queryKey: ['latest-incomes', year],
    queryFn: () => fetchGADBudgets(year),
    select: (data) => data
      .filter((entry): entry is GADBudgetEntry => entry.gbud_type === 'Income')
      .sort((a, b) => new Date(b.gbud_datetime).getTime() - new Date(a.gbud_datetime).getTime())
      .slice(0, 5)
      .map(transformBudgetEntry),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};