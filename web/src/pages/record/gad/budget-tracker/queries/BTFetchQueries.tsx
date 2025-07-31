import { useQuery } from "@tanstack/react-query";
import {
    fetchGADBudgets,
    fetchGADBudgetEntry,
    fetchIncomeParticulars,
    fetchExpenseParticulars,
    fetchGADBudgetFile,
    fetchGADBudgetFiles
} from "../requestAPI/BTGetRequest";

import { GADBudgetEntryUI, GADBudgetEntry, DevelopmentBudgetItem, GADBudgetFile } from "../budget-tracker-types";

const transformBudgetEntry = (entry: GADBudgetEntry): GADBudgetEntryUI => {
//   console.log("Transforming Entry:", entry);
  return {
    ...entry,
    gbud_particulars: entry.gbud_type === 'Income' 
      ? entry.gbud_inc_particulars || null
      : entry.gbud_exp_particulars || null,
    gbud_amount: entry.gbud_type === 'Income'
      ? entry.gbud_inc_amt ? Number(entry.gbud_inc_amt) : null
      : entry.gbud_actual_expense ? Number(entry.gbud_actual_expense) : null
  };
};

// React Query hooks
export const useGADBudgets = (year?: string) => {
    return useQuery({
        queryKey: ['gad-budgets', year],
        queryFn: () => fetchGADBudgets(year || ''),
        enabled: !!year,
        select: (data) => data.map(transformBudgetEntry),
        staleTime: 1000 * 60 * 5,
    });
};

export const useGADBudgetEntry = (gbud_num?: number) => {
    return useQuery({
        queryKey: ['gad-budget-entry', gbud_num],
        queryFn: () => fetchGADBudgetEntry(gbud_num || 0),
        enabled: !!gbud_num,
        select: transformBudgetEntry,
        staleTime: 1000 * 60 * 5,
    });
};

export const useIncomeParticulars = (year?: string) => {
    return useQuery({
        queryKey: ['income-particulars', year],
        queryFn: () => fetchIncomeParticulars(year || ''),
        enabled: !!year,
        staleTime: 1000 * 60 * 30,
    });
};

export const useExpenseParticulars = () => {
    return useQuery<DevelopmentBudgetItem[]>({
        queryKey: ['expense-particulars'],
        queryFn: fetchExpenseParticulars,
        staleTime: 1000 * 60 * 60 * 24,
    });
};

export const useGADBudgetFiles = () => {
    return useQuery<GADBudgetFile[]>({
        queryKey: ['gad-budget-files'],
        queryFn: fetchGADBudgetFiles,
        staleTime: 1000 * 60 * 15, 
    });
};

export const useGADBudgetFile = (gbf_id?: number) => {
    return useQuery<GADBudgetFile>({
        queryKey: ['gad-budget-file', gbf_id],
        queryFn: () => fetchGADBudgetFile(gbf_id || 0),
        enabled: !!gbf_id,
        staleTime: 1000 * 60 * 15, 
    });
};