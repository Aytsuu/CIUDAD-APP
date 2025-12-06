import { api2 } from "@/api/api";
export const processMedicineRequest = async (
  data: any,
  staffId: string | null
) => {
  try {
    // Prepare the complete request data including files
    const requestData = {
      pat_id: data.pat_id,
      signature: data.signature,
      medicines: data.medicines,
      files: data.files || [],
      staff_id: staffId
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Submitting medicine request with data:', requestData);
    }
    // Send everything to the backend in one API call
    const response = await api2.post('medicine/create-medicine/request/', requestData);
    
    return response.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Medicine request failed:', error.response?.data || error);
    }
    // Do not throw in production; only log in development
  }
};