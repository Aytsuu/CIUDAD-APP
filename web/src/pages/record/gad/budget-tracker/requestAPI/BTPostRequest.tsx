// import api from '@/pages/api/api';

// export type GADBudgetFile = {
//   gbf_id?: number;
//   gbf_name: string;
//   gbf_type: string;
//   gbf_path: string;
//   gbf_url: string;
//   gbud_num: number;
// };

// export type GADBudgetCreatePayload = {
//   gbud_type: 'Income' | 'Expense';
//   gbud_datetime: string;
//   gbud_add_notes?: string | null;
  
//   // Income fields
//   gbud_inc_particulars?: string | null;
//   gbud_inc_amt?: number | null;
  
//   // Expense fields
//   gbud_exp_particulars?: string | null;
//   gbud_proposed_budget?: number | null;
//   gbud_actual_expense?: number | null;
//   gbud_remaining_bal?: number | null;
//   gbud_reference_num?: string | null;
  
//   // Relations
//   gbudy: number;
//   gdb_id?: number | null;
// };

// export const createGADBudget = async (payload: GADBudgetCreatePayload) => {
//   const response = await api.post('/gad/gad-budget-tracker-table/', payload);
//   return response.data;
// };

// export const createGADBudgetFile = async (fileData: GADBudgetFile) => {
//   const response = await api.post('/gad/gad-budget-files/', fileData);
//   return response.data;
// };

import api from '@/pages/api/api';
import { MediaUploadType } from '@/components/ui/media-upload';

export type GADBudgetFile = {
  gbf_id?: number;
  gbf_name: string;
  gbf_type: string;
  gbf_path: string;
  gbf_url: string;
  gbud_num: number;
};

export type GADBudgetCreatePayload = {
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
  onChange?: string;
};

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