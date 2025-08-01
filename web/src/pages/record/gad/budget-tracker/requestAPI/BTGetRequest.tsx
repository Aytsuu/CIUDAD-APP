import { api } from "@/api/api";
import { GADBudgetEntry, DevelopmentBudgetItem, GADBudgetFile } from "../budget-tracker-types";

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
        const particulars = budgets
            .filter(entry => entry.gbud_type === 'Income' && entry.gbud_inc_particulars)
            .map(entry => entry.gbud_inc_particulars as string)
            .filter((value, index, self) => value && self.indexOf(value) === index);
    
        return particulars;
    } catch (error) {
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