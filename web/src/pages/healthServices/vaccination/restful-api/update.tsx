import { api2 } from "@/api/api";

export const updateVaccinationHistory = async (
  vachist_id: string,
  vachist_status:
    | "forwarded"
    | "completed"
    | "partially vaccinated"
    | "scheduled"
) => {
  try {
    const response = await api2.put(
      `vaccination/vaccination-history/${vachist_id}/`,
      {
        vachist_status,
        updated_at: new Date().toISOString(),
      }
    );
    return response.data;
    
  } catch (error) {
    console.error("Error updating vaccination history:", error);
    throw error;
  }
};
