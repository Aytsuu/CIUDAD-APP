import { api2 } from "@/api/api";

export const createMedicineRecord = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("/medicine/create-medicine-record/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating medicine record:", error);
    throw error;
  }
};

export const createPatientRecord = async (pat_id: string,pat_type:string) => {
  const response = await api2.post("patientrecords/patient-record/", {
    patrec_type:pat_type,
    pat_id: pat_id,
    created_at: new Date().toISOString(),
  });
  return response.data;
};
