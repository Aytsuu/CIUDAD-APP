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


export const getPatientPostpartumCount = async (patientId: string): Promise<number> => {
  try {
    console.log("Fetching postpartum count for patient:", patientId)
    const res = await api2.get(`maternal/patient/${patientId}/postpartum_count/`)

    console.log("Postpartum count response:", res.data)
    return res.data.postpartum_count || 0
  } catch (error) {
    if (error) {
      console.error("Get Patient Postpartum Count Error:", (error as any)?.data || (error as any)?.message)

      // If patient not found or no records, return 0
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response &&
        (error as any).response.status === 404
      ) {
        return 0
      }
    } else {
      console.error("Unexpected Error:", error)
    }

    // Return 0 on error to prevent UI issues
    return 0
  }
}

// Get all postpartum records for a specific patient
export const getPatientPostpartumRecords = async (patientId: string) => {
  try {
    console.log("Fetching postpartum records for patient:", patientId)
    const res = await api2.get(`maternal/patient/${patientId}/postpartum_records/`)

    console.log("Patient postpartum records response:", res.data)
    return res.data
  } catch (error) {
    if (error) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: any }; message?: string };
        console.error("Get Patient Postpartum Records Error:", err.response?.data || err.message);
      } else {
        console.error("Get Patient Postpartum Records Error:", (error as any)?.message || error);
      }
    } else {
      console.error("Unexpected Error:", error)
    }
    throw error
  }
}