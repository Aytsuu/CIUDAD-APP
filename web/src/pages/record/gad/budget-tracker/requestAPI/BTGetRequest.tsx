import {api} from '@/api/api';
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

export const fetchExpenseParticulars = async (): Promise<DevelopmentBudgetItem[]> => {
    const response = await api.get('/gad/development-budget-items/');
    return response.data?.data || [];
};

export const fetchIncomeParticulars = async (year: string): Promise<string[]> => {
    try {
        const budgets = await fetchGADBudgets(year);
        
        // Debug log to check the raw data
        console.log('Raw income entries:', budgets.filter(entry => entry.gbud_type === 'Income'));
        
        const particulars = budgets
            .filter(entry => entry.gbud_type === 'Income' && entry.gbud_inc_particulars)
            .map(entry => entry.gbud_inc_particulars as string)
            .filter((value, index, self) => value && self.indexOf(value) === index);
        
        // Debug log to check processed particulars
        console.log('Processed income particulars:', particulars);
        
        return particulars;
    } catch (error) {
        console.error('Error fetching income particulars:', error);
        return [];
    }
};

export const fetchGADBudgetFiles = async (): Promise<GADBudgetFile[]> => {
    const response = await api.get('/gad/gad-budget-files/');
    return response.data || [];
};

export const fetchGADBudgetFile = async (gbf_id: number): Promise<GADBudgetFile> => {
    const response = await api.get(`/gad/gad-budget-files/${gbf_id}/`);
    return response.data;
};