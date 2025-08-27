import { api } from "@/api/api";

// Search residents by name

// Create personal clearance
export const createPersonalClearance = async (payload: any) => {
  try {

    console.log('payload', payload)
    const staffId = "00001250821";
    const clearancePayload = {
      cr_req_request_date: new Date().toISOString().split('T')[0],
      cr_req_claim_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      cr_req_status: 'Pending',
      cr_req_payment_status: 'Unpaid',
      pr_id: payload.purpose || null,
      rp_id: payload?.rp_id ,
      staff_id: staffId
    };

    console.log("Creating personal clearance with payload:", clearancePayload);
    const response = await api.post('/clerk/certificate/', clearancePayload);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create personal clearance:", error);
    throw new Error(error.response?.data?.detail || "Failed to create personal clearance");
  }
};