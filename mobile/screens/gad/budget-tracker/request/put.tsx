import { api } from '@/api/api';
import { GADBudgetUpdatePayload } from '../bt-types';

export const updateGADBudget = async (gbud_num: number, payload: GADBudgetUpdatePayload) => {
  try {
    const response = await api.patch(`/gad/gad-budget-tracker-entry/${gbud_num}/`, payload);
    return response.data;
  } catch (err) {
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
    throw error;
  }
};