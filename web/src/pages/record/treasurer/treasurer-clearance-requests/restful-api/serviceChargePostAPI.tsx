import { api } from "@/api/api";

export interface UpdateServiceChargeStatusRequest {
  sr_code?: string;
  pay_status?: string;
}

export const updateServiceChargeStatus = async (
  pay_id: string | number,
  data: UpdateServiceChargeStatusRequest
) => {
  const response = await api.put(`clerk/treasurer/service-charge-payment/${pay_id}/`, data);
  return response.data;
};

export const declineServiceChargeRequest = async (
  pay_id: string | number,
  reason: string
) => {
  const response = await api.put(`clerk/treasurer/service-charge-payment/${pay_id}/`, {
    pay_req_status: "Declined",
    pay_reason: reason
  });
  return response.data;
};
