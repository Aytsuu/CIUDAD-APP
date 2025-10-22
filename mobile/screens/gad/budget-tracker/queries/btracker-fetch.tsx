import { useQuery } from "@tanstack/react-query";
import {
    fetchGADBudgets,
    fetchGADBudgetEntry,getBudgetAggregates,
    fetchGADBudgetFile, fetchBudgetLog,
    fetchGADBudgetFiles, fetchProjectProposalsAvailability
} from "../request/btracker-get";
import { GADBudgetEntryUI, GADBudgetEntry, GADBudgetFile, ProjectProposal, BudgetLogTable } from "../gad-btracker-types";

const transformBudgetEntry = (entry: GADBudgetEntry): GADBudgetEntryUI => {
  return {
    ...entry,
    gbud_particulars: entry.gbud_exp_particulars || undefined,
    gbud_amount: entry.gbud_actual_expense ? Number(entry.gbud_actual_expense) : null,
    gbud_exp_particulars: entry.gbud_exp_particulars
      ? Array.isArray(entry.gbud_exp_particulars) 
        ? entry.gbud_exp_particulars 
        : undefined
      : undefined,
    files: entry.files || [],
  };
};

export const useGADBudgets = (
  year?: string,
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  selectedMonth?: string,
  isArchive?: boolean
) => {
  return useQuery({
    queryKey: ['gad-budgets', year, page, pageSize, searchQuery, selectedMonth, isArchive],
    queryFn: () => fetchGADBudgets(year || '', page, pageSize, searchQuery, selectedMonth, isArchive),
    enabled: !!year,
    select: (data) => ({
      results: data.results.map(transformBudgetEntry),
      count: data.count
    }),
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

export const useGADBudgetLogs = (
  year: string, 
  page: number = 1, 
  pageSize: number = 10, 
  searchQuery?: string
) => {
  return useQuery<{
    results: BudgetLogTable[];
    count: number;
    next: string | null;
    previous: string | null;
  }, Error>({
    queryKey: ["gadBudgetLogs", year, page, pageSize, searchQuery],
    queryFn: () => fetchBudgetLog(year, page, pageSize, searchQuery),
    enabled: !!year,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetBudgetAggregates = (year: string, options = {}) => {
  return useQuery<{
    total_budget: number;
    total_expenses: number;
    pending_expenses: number; // Add this
    remaining_balance: number;
  }, Error>({
    queryKey: ["budgetAggregates", year],
    queryFn: () => getBudgetAggregates(year),
    enabled: !!year,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};