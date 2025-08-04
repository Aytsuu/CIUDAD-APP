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


export interface AppointmentFilters {
	page?: number;
	page_size?: number;
	status?: string;
	search?: string;
	time_frame?: string;
}

// fetch all follow-up visits
export const getAllFollowUpVisits = async (filters: AppointmentFilters = {}) => {
  try {
	const params = new URLSearchParams();

	if(filters.page) params.append('page', filters.page.toString());
	if(filters.page_size) params.append('page_size', filters.page_size.toString());
	if(filters.status && filters.status !== 'All') params.append('status', filters.status);
	if(filters.search) params.append('search', filters.search);
	if(filters.time_frame) params.append('time_frame', filters.time_frame);

	const queryString = params.toString();
	const url = queryString 
		? `patientrecords/follow-up-visits-all/?${queryString}` 
		: "patientrecords/follow-up-visits-all/";

    const res = await api2.get(url)
    return res.data || {count: 0, next: null, previous: null, results: []}
  } catch (error) {
    console.error("Error fetching all follow-up visits:", error)
    return {count: 0, next: null, previous: null, results: []}
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



export const getchilddata = async (pat_id: string) => {
	try {
	  const childres = await api2.get(`/child-health/child-health-records/by-patient/${pat_id}`)
	  return childres.data
	} catch (error) {
	  console.error("Error fetching child health records:", error)
	  throw new Error("Failed to fetch child health records. Please try again later.")
	}
  }