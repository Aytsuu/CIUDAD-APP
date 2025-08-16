import { api } from "@/api/api";
import { GADBudgetCreatePayload } from "../bt-types";

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
    throw err;
  }
}