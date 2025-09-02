import { api } from "@/api/api";
import { MediaUploadType } from '@/components/ui/media-upload';
import { GADBudgetUpdatePayload } from "../budget-tracker-types";

export const updateGADBudget = async (gbud_num: number, payload: GADBudgetUpdatePayload) => {
  try {
    const response = await api.patch(`/gad/gad-budget-tracker-entry/${gbud_num}/`, payload);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const createGADBudgetFile = async (_media: MediaUploadType[number], _gbud_num: number) => {
    //  if (media.status !== 'uploaded' || !media.publicUrl || !media.storagePath) {
    //    throw new Error('File upload incomplete: missing URL or path');
    //  }
    //  const formData = new FormData();
    //  formData.append('file', media.file);
    //  formData.append('gbud', gbud_num.toString());
    //  formData.append('gbf_name', media.file.name);
    //  formData.append('gbf_type', media.file.type || 'image/jpeg');
    //  formData.append('gbf_path', media.storagePath);
    //  formData.append('gbf_url', media.publicUrl);
    //  try {
    //    const response = await api.post('/gad/gad-budget-files/', formData, {
    //      headers: { 'Content-Type': 'multipart/form-data' },
    //    });
    //    return response.data;
    //  } catch (error: any) {
    //    throw error;
    //  }
   };