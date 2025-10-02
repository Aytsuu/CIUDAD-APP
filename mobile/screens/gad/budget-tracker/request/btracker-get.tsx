import { api } from '@/api/api';
import { GADBudgetFile, GADBudgetEntry } from '../gad-btracker-types';

export const fetchGADBudgets = async (
  year: string,
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  selectedMonth?: string,
  isArchive?: boolean
): Promise<{ results: GADBudgetEntry[]; count: number }> => {
  const params: any = {
    page,
    page_size: pageSize,
  };
  
  if (searchQuery) params.search = searchQuery;
  if (selectedMonth && selectedMonth !== "All") params.month = selectedMonth;
  if (isArchive !== undefined) params.is_archive = isArchive;
  
  const response = await api.get(`/gad/gad-budget-tracker-table/${year}/`, { params });
  return {
    results: response.data.results || response.data || [],
    count: response.data.count || 0
  };
};

export const fetchGADBudgetEntry = async (gbud_num: number): Promise<GADBudgetEntry> => {
    const response = await api.get(`/gad/gad-budget-tracker-entry/${gbud_num}/`);
    return response.data;
};

export const fetchBudgetYears = async (): Promise<any[]> => {
    const response = await api.get('/gad/gad-budget-tracker-main/');
    return response.data || [];
};

export const fetchGADBudgetFiles = async (): Promise<GADBudgetFile[]> => {
    const response = await api.get('/gad/gad-budget-files/');
    return response.data || [];
};

export const fetchGADBudgetFile = async (gbf_id: number): Promise<GADBudgetFile> => {
    const response = await api.get(`/gad/gad-budget-files/${gbf_id}/`);
    return response.data;
};

export const fetchProjectProposalsAvailability = async (year: string) => {
  const response = await api.get(`/gad/project-proposals-availability/${year}/?status=Approved`);
  return response.data.data;
};

export const fetchBudgetLog = async (
  year: string, 
  page: number = 1, 
  pageSize: number = 10, 
  searchQuery?: string
) => {
  const params: any = {
    page,
    page_size: pageSize
  };
  
  if (searchQuery) {
    params.search = searchQuery;
  }
  
  const response = await api.get(`/gad/budget-logs/${year}/`, { params });
  return response.data;
};