import { api2 } from "@/api/api"

// fetch residents
export const getResident = async () => {
	 try {
		  const res = await api2.get("/patientrecords/residents-available/")
		  return res.data || [];
	 } catch (error) {
		  console.error("Error fetching residents:", error);
        
		if (typeof error === "object" && error !== null && "response" in error) {
			const err = error as { response: { status: number; data: any } };
			console.error("Response status:", err.response.status);
			// console.error("Response data:", err.response.data);
		}
	 }
}


// fetch patients
export const getPatients = async () => {
    try {
        const res = await api2.get("patientrecords/patient/");
        return res.data || []; 
    } catch (error) {
        console.error("Network Error:", error);
        return []; 
    }
};


// fetch patient details
export const getPatientDetails = async (patientId: string) => {
	try {
		const res = await api2.get(`patientrecords/patient/${patientId}/`)
		return res.data;
	} catch (error) {
		console.error("Error fetching patient:", error)

		if (typeof error === "object" && error !== null && "response" in error) {
			const err = error as { response: { status: number; data: any } }
			if (err.response.status === 404) {
			throw new Error("Patient not found")
			}
		}
		throw error
	}
}


// fetch all follow-up visits
export const getAllFollowUpVisits = async () => {
  try {
    const res = await api2.get("patientrecords/follow-up-visits-all/")
    return res.data || []
  } catch (error) {
    console.error("Error fetching all follow-up visits:", error)
    return []
  }
}


// fetch all transient addresses
export const getAllTransientAddresses = async () => {
	try {
		const res = await api2.get("patientrecords/transient/address/")
		return res.data || {}
	} catch (error) {
		console.error("Error fetching transient address: ", error)
		return []
	}
}