import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import {
    fetchGADBudgets,
    fetchGADBudgetEntry,
    fetchIncomeParticulars,
    fetchExpenseParticulars,
    GADBudgetEntry,
    DevelopmentBudgetItem,
    fetchGADBudgetFile,
    fetchGADBudgetFiles
} from "../request/get";

import { GADBudgetFile } from "../request/post";

export type GADBudgetEntryUI = GADBudgetEntry & {
    gbud_particulars?: string | null;
    gbud_amount?: number | null;
};

const transformBudgetEntry = (entry: GADBudgetEntry): GADBudgetEntryUI => {
  return {
    ...entry,
    gbud_inc_amt: entry.gbud_inc_amt != null ? Number(entry.gbud_inc_amt) : undefined,
    gbud_proposed_budget: entry.gbud_proposed_budget != null ? Number(entry.gbud_proposed_budget) : undefined,
    gbud_actual_expense: entry.gbud_actual_expense != null ? Number(entry.gbud_actual_expense) : undefined,
    gbud_particulars: entry.gbud_type === 'Income' 
      ? entry.gbud_inc_particulars || null
      : entry.gbud_exp_particulars || null,
    gbud_amount: entry.gbud_type === 'Income'
      ? entry.gbud_inc_amt ? Number(entry.gbud_inc_amt) : null
      : entry.gbud_actual_expense ? Number(entry.gbud_actual_expense) : null
  };
};


export const useGADBudgets = (year?: string) => {
    return useQuery({
        queryKey: ['gad-budgets', year],
        queryFn: async () => {
            const data = await fetchGADBudgets(year || '');
            console.log('fetchGADBudgets raw response:', data);
            return data;
        },
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

export const useGetGADBudgetEntry = (gbud_num: number | undefined) => {
  return useQuery<GADBudgetEntry>({
    queryKey: ["gad-budget-entry", gbud_num],
    queryFn: async () => {
      if (!gbud_num) throw new Error("Entry ID is required");
      const response = await api.get(`/gad/gad-budget-tracker-entry/${gbud_num}/`);
      return response.data;
    },
    enabled: !!gbud_num,
  });
};