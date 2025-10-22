import { api } from "@/api/api";

export interface UpdateServiceChargeStatusRequest {
  sr_code?: string;
  status?: string;
}

export const updateServiceChargeStatus = async (
  pay_id: string | number,
  data: UpdateServiceChargeStatusRequest
) => {
  const response = await api.put(`clerk/treasurer/service-charge-payment/${pay_id}/`, data);
  return response.data;
};
