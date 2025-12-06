import { api2 } from "@/api/api";

export const updateVaccinationHistory = async (
data:Record<string,any>
) => {
  try {
    const response = await api2.patch(
      `vaccination/vaccination-history/${data.vachist_id}/`,
     data
    );
    return response.data;
  } catch (error) {
    {process.env.NODE_ENV === 'development' && console.error("Error updating vaccination history:", error);}
  }
};



  
  // New API function for updating follow-up visit
  export const updateFollowUpVisit = async (data:Record<string,any>) => {
    try {
      await api2.patch(`patientrecords/follow-up-visit/${parseInt(data.followv_id, 10)}/`,data);
    } catch (error) {
      {process.env.NODE_ENV === 'development' && console.error("Error updating follow-up visit:", error);}
    }
  };
  