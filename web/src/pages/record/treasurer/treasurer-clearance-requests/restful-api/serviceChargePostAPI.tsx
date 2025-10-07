import { api } from "@/api/api";

export interface UpdateServiceChargeStatusRequest {
  sr_code?: string;
  status?: string;
}

export const updateServiceChargeStatus = async (
  sr_id: string | number,
  data: UpdateServiceChargeStatusRequest
) => {
  const response = await api.put(`clerk/update-summon-request/${sr_id}/`, data);
  return response.data;
};
