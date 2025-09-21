import { api } from "@/api/api";
import { GADBudgetCreatePayload, FileUploadPayload } from "../gad-btracker-types";

export const createGADBudget = async (payload: GADBudgetCreatePayload) => {
  const response = await api.post('/gad/gad-budget-tracker-table/', payload);
  return response.data;
};

export const createGADBudgetFile = async (
  gbud_num: number,
  files: FileUploadPayload[]
) => {
  try {
    // Filter for valid files
    const validFiles = files.filter(file => 
      file.file && 
      typeof file.file === 'string' && 
      file.file.startsWith('data:')
    );

    if (validFiles.length === 0) {
      console.warn('No valid files to upload');
      return { success: true, message: 'No valid files to upload' };
    }

    console.log(`Uploading ${validFiles.length} files to server`);

    const response = await api.post('/gad/gad-budget-files/', {
      gbud_num: gbud_num,
      files: validFiles.map(file => ({
        name: file.name || `file_${Date.now()}`,
        type: file.type || 'image/jpeg',
        file: file.file, // base64 data with data: prefix
        path: file.path || `uploads/${file.name || `file_${Date.now()}`}`
      }))
    });

    return response.data;
  } catch (err) {
    console.error('File upload error:', err);
    throw new Error('Failed to upload files to server');
  }
};