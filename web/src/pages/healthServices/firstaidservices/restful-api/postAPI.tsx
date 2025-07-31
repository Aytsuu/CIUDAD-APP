import {api2} from "@/api/api";



export const createFirstaidRecord = async (data: Record<string, any>) => {
  try {
    const response = await api2.post(
        "/firstaid/create-firstaid-record/",
        data
      );
      console.log("firstaid Record Response:", response.data); // Debugging log
    return response.data;
  } catch (error) {
    console.error('Error creating firstaid record:', error);
    throw error;
  }
}

export const createPatientRecord = async (pat_id: string) => {
    const response = await api2.post("patientrecords/patient-record/", {
      patrec_type: "Firstaid Request",
      pat_id: pat_id,
      created_at: new Date().toISOString(),
    });
    console.log("Patient Record Response:", response.data); // Debugging log
    return response.data;
  };
  