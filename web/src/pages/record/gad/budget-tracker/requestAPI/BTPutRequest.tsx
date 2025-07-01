import api from '@/pages/api/api';
import { MediaUploadType } from '@/components/ui/media-upload';
import { GADBudgetFile } from './BTPostRequest';

export type GADBudgetUpdatePayload = {
  gbud_type: 'Income' | 'Expense';
  gbud_datetime: string;
  gbud_add_notes?: string | null;
  gbud_inc_particulars?: string | null;
  gbud_inc_amt?: number | null;
  gbud_exp_particulars?: string | null;
  gbud_proposed_budget?: number | null;
  gbud_actual_expense?: number | null;
  gbud_remaining_bal?: number | null;
  gbud_reference_num?: string | null;
  gbudy: number;
  gdb_id?: number | null;
};

export const updateGADBudget = async (gbud_num: number, payload: GADBudgetUpdatePayload) => {
  try {
    const response = await api.patch(`/gad/gad-budget-tracker-entry/${gbud_num}/`, payload);
    return response.data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};

export const createGADBudgetFile = async (media: MediaUploadType[number], gbud_num: number) => {
     if (media.status !== 'uploaded' || !media.publicUrl || !media.storagePath) {
       throw new Error('File upload incomplete: missing URL or path');
     }
     const formData = new FormData();
     formData.append('file', media.file);
     formData.append('gbud', gbud_num.toString());
     formData.append('gbf_name', media.file.name);
     formData.append('gbf_type', media.file.type || 'image/jpeg');
     formData.append('gbf_path', media.storagePath);
     formData.append('gbf_url', media.publicUrl);
     try {
       const response = await api.post('/gad/gad-budget-files/', formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
       });
       return response.data;
     } catch (error: any) {
       console.error('File upload failed:', error.response?.data || error);
       throw error;
     }
   };