import { api2 } from "@/api/api"

export const createPatients = async (patientData:any) => {
	 try {
		  const res = await api2.post("patientrecords/patient/", patientData);
		  if (res.status !== 201) {
			   throw new Error("Failed to create patient record");
		  }
		  return res.data;
	 } catch (error) {
		  console.error("Error:", error);	
		  throw error;
	 }
}
