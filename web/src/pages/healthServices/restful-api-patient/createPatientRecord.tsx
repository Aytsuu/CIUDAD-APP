import { api2 } from "@/api/api";



export const createPatientRecord = async (pat_id: string,pat_type:string,staff_id:string| null) => {
    const response = await api2.post("patientrecords/patient-record/", {
      patrec_type:pat_type,
      pat_id: pat_id,
      created_at: new Date().toISOString(),
      staff:staff_id || null
    });
    return response.data;
  };
  