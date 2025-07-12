import { useQuery } from "@tanstack/react-query";
import type { GADBudgetEntryUI } from "@/pages/record/gad/budget-tracker/queries/BTFetchQueries";
import { GADBudgetEntry, fetchGADBudgets } from "@/pages/record/gad/budget-tracker/requestAPI/BTGetRequest";
import { getbudgetyearreq } from "@/pages/record/gad/budget-tracker/requestAPI/BTYearReq";

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

const QUARTERS = [
  { name: "Jan-Mar", months: ["Jan", "Feb", "Mar"] },
  { name: "Apr-Jun", months: ["Apr", "May", "Jun"] },
  { name: "Jul-Sep", months: ["Jul", "Aug", "Sep"] },
  { name: "Oct-Dec", months: ["Oct", "Nov", "Dec"] }
];

interface QuarterlyBudgetData {
  name: string;
  expense: number;
  income: number;
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
        type: entry.gbud_type,
        amount: entry.gbud_type === 'Income' 
          ? entry.gbud_inc_amt 
          : entry.gbud_actual_expense
      })));

      return QUARTERS.map((quarter) => {
        const result = {
          name: quarter.name,
          income: 0,
          expense: 0,
          net: 0
        };

        data.forEach(entry => {
          const month = new Date(entry.gbud_datetime).toLocaleString('default', { month: 'short' });
          if (quarter.months.includes(month)) {
            if (entry.gbud_type === 'Income') {
              result.income += Number(entry.gbud_inc_amt) || 0;
            } else {
              const amount = entry.gbud_actual_expense !== null 
                ? Number(entry.gbud_actual_expense)
                : 0;
              result.expense += amount;
            }
          }
        });

        result.net = result.income - result.expense;
        return result;
      });
    },
    staleTime: 1000 * 60 * 5
  });
};

export type GADBudgetYearEntry = {
    gbudy_num: number;
    gbudy_year: string;
    gbudy_budget: number;
    gbudy_expenses: number;
    gbudy_income: number;
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