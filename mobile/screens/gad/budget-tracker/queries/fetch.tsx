import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import {
    fetchGADBudgets,
    fetchGADBudgetEntry,
    fetchIncomeParticulars,
    fetchExpenseParticulars,
    fetchGADBudgetFile,
    fetchGADBudgetFiles
} from "../request/get";
import { GADBudgetFile, GADBudgetEntryUI, GADBudgetEntry, DevelopmentBudgetItem } from "../bt-types";

const transformBudgetEntry = (entry: GADBudgetEntry): GADBudgetEntryUI => {
  const toNumberIfNumeric = (val: any) => {
    if (val === null || val === undefined) return undefined;
    return isNaN(val) ? val : Number(val);
  };

  return {
    ...entry,
    gbud_inc_amt: toNumberIfNumeric(entry.gbud_inc_amt),
    gbud_proposed_budget: toNumberIfNumeric(entry.gbud_proposed_budget),
    gbud_actual_expense: toNumberIfNumeric(entry.gbud_actual_expense),
    gbud_particulars:
      entry.gbud_type === 'Income'
        ? entry.gbud_inc_particulars || null
        : entry.gbud_exp_particulars || null,
    gbud_amount:
      entry.gbud_type === 'Income'
        ? toNumberIfNumeric(entry.gbud_inc_amt) ?? null
        : toNumberIfNumeric(entry.gbud_actual_expense) ?? null,
  };
};

export const useGADBudgets = (year?: string) => {
    return useQuery({
        queryKey: ['gad-budgets', year],
        queryFn: async () => {
            const data = await fetchGADBudgets(year || '');
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