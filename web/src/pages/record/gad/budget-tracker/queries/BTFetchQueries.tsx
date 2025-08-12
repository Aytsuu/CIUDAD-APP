import { useQuery } from "@tanstack/react-query";
import {
    fetchGADBudgets,
    fetchGADBudgetEntry,
    fetchIncomeParticulars,
    fetchGADBudgetFile, fetchBudgetLog,
    fetchGADBudgetFiles, fetchProjectProposalsAvailability
} from "../requestAPI/BTGetRequest";

import { GADBudgetEntryUI, GADBudgetEntry, GADBudgetFile, ProjectProposal, BudgetLogTable } from "../budget-tracker-types";

const transformBudgetEntry = (entry: GADBudgetEntry): GADBudgetEntryUI => {
  return {
    ...entry,
    gbud_particulars: entry.gbud_type === 'Income' 
      ? entry.gbud_inc_particulars || undefined
      : entry.gbud_exp_particulars || undefined,
    gbud_amount: entry.gbud_type === 'Income'
      ? entry.gbud_inc_amt ? Number(entry.gbud_inc_amt) : null
      : entry.gbud_actual_expense ? Number(entry.gbud_actual_expense) : null,
    gbud_exp_particulars: entry.gbud_type === 'Expense' && entry.gbud_exp_particulars
      ? Array.isArray(entry.gbud_exp_particulars) 
        ? entry.gbud_exp_particulars 
        : undefined
      : undefined,
    files: entry.files || [],
  };
};

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

export const useProjectProposalsAvailability = (year?: string) => {
  return useQuery<ProjectProposal[], Error>({
    queryKey: ["projectProposalsAvailability", year],
    queryFn: () => fetchProjectProposalsAvailability(year || ""),
    enabled: !!year,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGADBudgetLogs = (year: string) => {
  return useQuery<BudgetLogTable[], Error>({
    queryKey: ["gadBudgetLogs", year],
    queryFn: () => fetchBudgetLog(year),
    enabled: !!year,
    staleTime: 1000 * 60 * 5,
  });
};