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

// patientsGetAPI.tsx
export const getPatients = async () => {
    try {
        const res = await api2.get("patientrecords/patient/");
        return res.data || []; // Fallback if undefined
    } catch (error) {
        console.error("Network Error:", error);
        return []; // Always return a defined value
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



export const getAllFollowUpVisits = async () => {
  try {
    const res = await api2.get("patientrecords/follow-up-visits-all/")
    return res.data || []
  } catch (error) {
    console.error("Error fetching all follow-up visits:", error)
    return []
  }
}


// Get all postpartum records for a specific patient
// export const getPatientPostpartumRecords = async (patientId: string) => {
//   try {
//     console.log("Fetching postpartum records for patient:", patientId)
//     const res = await api2.get(`maternal/patient/${patientId}/postpartum_records/`)

//     console.log("Patient postpartum records response:", res.data)
//     return res.data
//   } catch (error) {
//     if (error) {
//       if (typeof error === "object" && error !== null && "response" in error) {
//         const err = error as { response?: { data?: any }; message?: string };
//         console.error("Get Patient Postpartum Records Error:", err.response?.data || err.message);
//       } else {
//         console.error("Get Patient Postpartum Records Error:", (error as any)?.message || error);
//       }
//     } else {
//       console.error("Unexpected Error:", error)
//     }
//     throw error
//   }
// }