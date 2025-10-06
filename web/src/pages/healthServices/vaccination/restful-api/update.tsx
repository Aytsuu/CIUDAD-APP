import { api2 } from "@/api/api";

export const updateVaccinationHistory = async (
data:Record<string,any>
) => {
  try {
    const response = await api2.put(
      `vaccination/vaccination-history/${data.vachist_id}/`,
     data
    );
    return response.data;
    
  } catch (error) {
    console.error("Error updating vaccination history:", error);
    throw error;
  }
};



  
  // New API function for updating follow-up visit
  export const updateFollowUpVisit = async (data:Record<string,any>) => {
    await api2.patch(`patientrecords/follow-up-visit/${parseInt(data.followv_id, 10)}/`,data);
  };
  