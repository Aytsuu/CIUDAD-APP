import { api } from "@/api/api";
import { GADBudgetEntry, GADBudgetFile } from "../budget-tracker-types";

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