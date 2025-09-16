// src/services/firstAidRequestService.ts
import { api2 } from "@/api/api";

export const processFirstRequest = async (data: any) => {
  try {
    // Prepare the complete request data
    const requestData = {
      pat_id: data.pat_id,
      signature: data.signature,
      firstaid: data.firstaid,
      staff_id: data.staff_id
    };

    console.log("Submitting first aid request with data:", requestData);

    // Send everything to the backend in one API call
    const response = await api2.post("firstaid/create-first-aid-inventory/", requestData);

    return response.data;
  } catch (error: any) {
    console.error("First aid request failed:", error.response?.data || error);
    throw new Error(error.response?.data?.error || "Failed to submit first aid request");
  }
};
