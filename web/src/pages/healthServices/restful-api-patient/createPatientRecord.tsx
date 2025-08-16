import { api2 } from "@/api/api";



export const createPatientRecord = async (data:Record<string,any>) => {
   try{
    const response = await api2.post("patientrecords/patient-record/", data);
    return response.data;
   }catch (error) {
    console.error("Error creating patient record:", error);
    throw new Error("Failed to create patient record");
   }
  };
  