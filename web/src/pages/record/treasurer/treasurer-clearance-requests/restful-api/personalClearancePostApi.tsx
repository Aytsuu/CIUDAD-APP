import { api } from "@/api/api";

export const createPersonalClearance = async (payload: any, staffId: string) => {
  try {
    // Validate required fields
    if (!payload.rp_id) {
      throw new Error("Resident profile ID (rp_id) is required");
    }
    
    // rp_id is a string, not an integer
    const rpId = payload.rp_id.toString().trim();
    
    if (!rpId) {
      throw new Error("Invalid resident profile ID");
    }
    
    // Convert purpose to integer if it exists
    let purposeId = null;
    if (payload.purpose) {
      purposeId = parseInt(payload.purpose);
      if (isNaN(purposeId)) {
        throw new Error("Invalid purpose ID");
      }
    }
    
    // Convert staffId to integer - staff_id should be a string that can be converted to int
    let staffIdStr = staffId.toString().trim();
    
    // Handle truncated staff_id by padding with zeros
    if (staffIdStr.length < 11) {
      staffIdStr = staffIdStr.padStart(11, '0');
    }
    
    const staffIdInt = parseInt(staffIdStr);
    if (isNaN(staffIdInt)) {
      throw new Error(`Invalid staff ID: ${staffId} (could not convert to integer)`);
    }
    
    const clearancePayload = {
      cr_req_request_date: new Date().toISOString().split('T')[0],
      cr_req_status: 'Pending',
      cr_req_payment_status: 'Unpaid',
      pr_id: purposeId,
      rp_id: rpId,
      staff_id: staffIdStr  // Send as string, not integer
    };
    
    const response = await api.post('/clerk/certificate/', clearancePayload);
    return response.data;
  } catch (error: any) {
    
    // Provide more specific error messages
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;
      if (typeof errorData === 'string' && errorData.includes('does_not_exist')) {
        throw new Error("Selected resident does not exist. Please select a valid resident.");
      }
    }
    
    throw new Error(error.response?.data?.detail || error.message || "Failed to create personal clearance");
  }
};


export const createNonResidentPersonalClearance = async(payload: any, staffId: string) =>{
  try{
    const res = await api.post('/clerk/nonresident-personal-clearance/', {
      nrc_req_date: new Date().toISOString().split('T')[0],
      nrc_req_status: 'Pending',
      nrc_req_payment_status: 'Unpaid',  
      nrc_lname: payload.last_name,
      nrc_fname: payload.first_name,
      nrc_mname: payload.middle_name || '', // Send empty string if middle_name is not provided
      nrc_address: payload.address,
      nrc_birthdate: payload.birthdate,
      pr_id: payload?.purpose,
      staff_id: parseInt(staffId) // Convert to integer for foreign key
    })
    
    return res.data
  }catch(err: any){
    throw new Error(err.response?.data?.detail || "Failed to create non-resident clearance");
  }
}