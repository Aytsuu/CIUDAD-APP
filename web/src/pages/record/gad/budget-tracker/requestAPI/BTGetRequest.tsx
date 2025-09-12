import api from '@/pages/api/api';
import { GADBudgetFile } from './BTPostRequest';

// Types
export type GADBudgetEntry = {
    gbud_num?: number;
    gbud_datetime: string;
    gbud_type: string;
    gbud_add_notes?: string;
    
    // Income fields
    gbud_inc_particulars?: string;
    gbud_inc_amt?: number;
    
    // Expense fields
    gbud_exp_particulars?: string;
    gbud_proposed_budget?: number;
    gbud_actual_expense?: number;
    gbud_remaining_bal?: number;
    gbud_reference_num?: string;
    gbud_is_archive?: boolean;
    // Relations
    gdb?: {
        gdb_id?: number;
        gdb_name?: string;
    };
    files?: Array<{
        gbf_id: number;
        gbf_name: string;
        gbf_type: string;
        gbf_path: string;
        gbf_url: string;
    }> | null;
};

export type DevelopmentBudgetItem = {
    gdb_id: number;
    gdb_name: string;
    gdb_pax: number;
    gdb_price: number;
};

export const fetchGADBudgets = async (year: string): Promise<GADBudgetEntry[]> => {
    const response = await api.get(`/gad/gad-budget-tracker-table/${year}/`);
    return response.data || [];
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

export const fetchBudgetLog = async (year: string) => {
  const response = await api.get(`/gad/budget-logs/${year}/`);
  return response.data.data;
};