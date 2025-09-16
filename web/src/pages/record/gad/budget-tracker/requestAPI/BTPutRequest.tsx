import { api } from "@/api/api";
import { GADBudgetUpdatePayload } from "../budget-tracker-types";

export const updateGADBudget = async (gbud_num: number, payload: GADBudgetUpdatePayload) => {
  try {
    const response = await api.patch(`/gad/gad-budget-tracker-entry/${gbud_num}/`, payload);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const createGADBudgetFile = async (gbud_num: number, files: Array<{ id: string; name: string; type: string; file: string | File }>) => {
  try {
    console.log('Received files in createGADBudgetFile:', files);

    const processedFiles = await Promise.all(files.map(async (file) => {
      if (file.file instanceof File) {
        // Convert File to base64 asynchronously
        const arrayBuffer = await file.file.arrayBuffer();
        const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        return {
          name: file.name,
          type: file.type,
          file: `data:${file.type};base64,${base64String}`
        };
      }
      return {
        name: file.name,
        type: file.type,
        file: file.file as string // Already base64
      };
    }));

    const payload = {
      gbud_num,
      files: processedFiles
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
