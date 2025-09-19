import { api2 } from "@/api/api"


export const createPatients = async (patientData: any) => {
	 try {
		  const res = await api2.post("patientrecords/patient/", patientData);
		  if (res.status !== 201) {
			   throw new Error("Failed to create patient record");
		  }
		  console.log(res)
		  return res.data;
		  
	 } catch (error) {
		  console.error("Error:", error);	
		  throw error;
	 }
}


export const registerPatient = async (patientData: any) => {
    try {
        const res = await api2.post("medicine/register-patient/", patientData);
        if (res.status !== 201) {
            throw new Error("Failed to register patient");
        }
        console.log(res);
        return res.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}



