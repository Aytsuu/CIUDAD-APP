import { api } from "@/api/api";
import { MediaUploadType } from '@/components/ui/media-upload';
import { GADBudgetCreatePayload } from "../budget-tracker-types";

export const createGADBudget = async (payload: GADBudgetCreatePayload) => {
  const response = await api.post('/gad/gad-budget-tracker-table/', payload);
  return response.data;
};

export const createGADBudgetFile = async (media: MediaUploadType[number], gbud_num: number) => {
  if (media.status !== 'uploaded' || !media.publicUrl || !media.storagePath) {
    throw new Error('File upload incomplete: missing URL or path');
  }

  const formData = new FormData();
  formData.append('file', media.file);
  formData.append('gbud', gbud_num.toString());
  formData.append('gbf_name', media.file.name);
  formData.append('gbf_type', media.file.type || 'application/octet-stream');
  formData.append('gbf_path', media.storagePath);
  formData.append('gbf_url', media.publicUrl);

  try {
    const response = await api.post('/gad/gad-budget-files/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('File upload failed:', error.response?.data || error);
    throw error;
  }
};