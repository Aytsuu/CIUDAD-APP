import { api } from "@/api/api";
import { AxiosError } from "axios";

export type MarkBusinessPermitVariables = {
  bpr_id: string;
  file_url?: string;
  staff_id?: string;
};

export const markBusinessPermitAsIssued = async (permitData: MarkBusinessPermitVariables) => {
  try {
    const res = await api.post('/clerk/mark-business-permit-issued/', permitData);
    return res.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error marking business permit as issued:', error.response?.data || error.message);
    throw error;
  }
};
