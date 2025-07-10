import { api2 } from "@/api/api";



export const createPatientRecord = async (pat_id: string,pat_type:string) => {
    const response = await api2.post("patientrecords/patient-record/", {
      patrec_type:pat_type,
      pat_id: pat_id,
      created_at: new Date().toISOString(),
    });
    return response.data;
  };
  