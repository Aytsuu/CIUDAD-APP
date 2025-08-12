import { api } from "@/api/api";
import { GADBudgetCreatePayload } from "../budget-tracker-types";

export const createGADBudget = async (payload: GADBudgetCreatePayload) => {
  const response = await api.post('/gad/gad-budget-tracker-table/', payload);
  return response.data;
};

export const createGADBudgetFile = async (gbud_num: number, files: Array<{ id: string; name: string; type: string; file?: string }>) => {
  try {
    console.log('Received files in createGADBudgetFile:', files);

    const payload = {
      gbud_num,
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        file: file.file
      }))
    };

    if (files.length === 0) {
      console.warn('No files provided. Skipping file upload.');
      return { status: 'No files uploaded' };
    }

    const response = await api.post('/gad/gad-budget-files/', payload);
    console.log('File upload response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to create file ${files[0]?.name || 'unknown'}:`, error);
    throw error;
  }
};