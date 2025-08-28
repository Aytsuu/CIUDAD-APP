import { api } from "@/api/api";

export const createPersonalClearance = async (payload: any) => {
  try {
    console.log('payload', payload)
    const staffId = "00001250821";
    const clearancePayload = {
      cr_req_request_date: new Date().toISOString().split('T')[0],
      cr_req_status: 'In Progress',
      cr_req_payment_status: 'Paid',
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


export const createNonResidentPersonalClearance = async(payload: any) =>{
  try{

    console.log('payload', payload)
    const staffId = "00001250821";

    const res = await api.post('/clerk/nonresident-personal-clearance/', {
      nrc_req_date: new Date().toISOString().split('T')[0],
      nrc_req_status: 'Pending',
      nrc_req_payment_status: 'Unpaid',  
      nrc_requester: payload.requester,
      nrc_address: payload.address,
      nrc_birthdate: payload.birthdate,
      pr_id: payload?.purpose,
      staff_id: staffId
    })
    
    return res.data
  }catch(err){
    console.error(err)
  }
}