import { api2 } from "@/api/api";

export const updateVaccinationHistory = async (
  vachist_id: string,
  vachist_status:
    | "forwarded"
    | "completed"
    | "partially vaccinated"
    | "scheduled",
  vital_id?: number | null,
) => {
  try {
    const response = await api2.put(
      `vaccination/vaccination-history/${vachist_id}/`,
      {
        vachist_status,
        updated_at: new Date().toISOString(),
        vital: vital_id , // Ensure vital_id is parsed as an integer
      }
    );
    return response.data;
    
  } catch (error) {
    console.error("Error updating vaccination history:", error);
    throw error;
  }
};



  
  // New API function for updating follow-up visit
  export const updateFollowUpVisit = async (followv_id: string, status: string) => {
    await api2.patch(`patientrecords/follow-up-visit/${parseInt(followv_id, 10)}/`, {
      followv_status: status,
    });
  };
  