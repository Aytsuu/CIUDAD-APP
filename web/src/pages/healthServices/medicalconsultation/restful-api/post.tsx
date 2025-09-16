import { api2 } from "@/api/api";

export const createMedicalConsultation = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("medical-consultation/medical-consultation-record/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating medical consultation:", error);
    throw error; // Re-throw for calling code
  }
};
