import { api } from "@/api/api";
import { AxiosError } from "axios";

// Mark service charge as issued/printed
export const markServiceChargeAsIssued = async (serviceChargeData: { sr_id: string, pay_id?: string }) => {
  try {
    console.log('Marking service charge as issued:', serviceChargeData);
    
    if (!serviceChargeData.pay_id) {
      throw new Error('Payment ID is required to mark service charge as completed');
    }
    
    // Use the existing payment status update endpoint
    const res = await api.put(`/clerk/treasurer/service-charge-payment/${serviceChargeData.pay_id}/`, {
      pay_req_status: 'Completed'
    });
    return res.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error marking service charge as issued:', error.response?.data || error.message);
    throw error;
  }
};
