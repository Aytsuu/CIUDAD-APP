import { api2 } from "@/api/api";


// Findings API
export const createFindings = async (data: {
    assessment_summary: string;
    plantreatment_summary: string;
    sub_summary: string;
    obj_summary: string;
  }) => {
    try {
    const response = await api2.post("patientrecords/findings/", {
      ...data,
      created_at: new Date().toISOString(),
    });
      if (!response.data?.find_id) {
        throw new Error("Failed to retrieve the finding ID from the response");
      }
      return response.data;
    } catch (error) {
      console.error("Error creating findings:", error);
      throw error;
    }
  };
  
  export const deleteFindings = async (findingId: string) => {
    try {
      await api2.delete(`patientrecords/findings/${findingId}/`);
    } catch (error) {
      console.error("Error deleting findings:", error);
      throw error;
    }
  };
  