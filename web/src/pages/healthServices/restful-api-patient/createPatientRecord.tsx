import { api2 } from "@/api/api";

export const createPatientRecord = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("patientrecords/patient-record/", data);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating patient record:", error);
    }
  }
};
