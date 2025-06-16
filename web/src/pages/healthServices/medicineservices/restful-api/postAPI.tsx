import {api} from "@/api/api";



export const createMedicineRecord = async (data: Record<string, any>) => {
  try {
    const response = await api.post(
        "/medicine/create-medicine-record/",
        data
      );
      console.log("Medicine Record Response:", response.data); // Debugging log
    return response.data;
  } catch (error) {
    console.error('Error creating medicine record:', error);
    throw error;
  }
}


export const createPatientRecord = async (pat_id: string) => {
    const response = await api.post("patientrecords/patient-record/", {
      patrec_type: "Medicine Request",
      pat_id: pat_id,
      created_at: new Date().toISOString(),
    });
    console.log("Patient Record Response:", response.data); // Debugging log
    return response.data;
  };
  