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
  reason: string,
  staff_id?: string | number
) => {
  const payload: {
    pay_req_status: string;
    pay_reason: string;
    staff_id?: string | number;
  } = {
    pay_req_status: "Declined",
    pay_reason: reason
  };
  
  // Include staff_id if provided
  if (staff_id) {
    payload.staff_id = staff_id;
  }
  
  const response = await api.put(`clerk/treasurer/service-charge-payment/${pay_id}/`, payload);
  return response.data;
};
