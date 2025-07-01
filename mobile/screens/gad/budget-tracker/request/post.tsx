import { api } from "@/api/api";

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

export const createGADBudgetFile = async (data: {
  gbud_num: number;
  file_data: {
    name: string;
    type: string;
    path: string;
    uri: string;
  };
}) => {
  try {
    const res = await api.post('/gad/gad-budget-files/', {
      gbud: data.gbud_num,
      gbf_name: data.file_data.name,
      gbf_type: data.file_data.type,
      gbf_path: data.file_data.path,
      gbf_url: data.file_data.uri
    });
    return res.data;
  } catch (err) {
    console.error(`Failed to create file ${data.file_data.name}:`, err);
    throw err;
  }
}