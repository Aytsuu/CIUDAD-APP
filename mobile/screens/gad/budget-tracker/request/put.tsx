import { api } from '@/api/api';
import { MediaFileType } from '@/components/ui/multi-media-upload';
import { GADBudgetFile } from './post';

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

export const createGADBudgetFile = async (
  media: {
    publicUrl: string;
    storagePath: string;
    status: "uploading" | "uploaded" | "error";
    file: { name: string; type: string };
  },
  gbud_num: number
) => {
  if (media.status !== "uploaded" || !media.publicUrl || !media.storagePath) {
    throw new Error("File upload incomplete: missing URL, path, or valid status");
  }

  const payload = {
    gbud: gbud_num,
    gbf_name: media.file.name,
    gbf_type: media.file.type || "image/jpeg",
    gbf_path: media.storagePath,
    gbf_url: media.publicUrl,
  };

  try {
    const response = await api.post("/gad/gad-budget-files/", payload);
    return response.data;
  } catch (error: any) {
    console.error("File upload failed:", error.response?.data || error);
    throw error;
  }
};