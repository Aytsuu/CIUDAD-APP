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
  tab?: string; // Add this for active tab filtering
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Enhanced getAllFollowUpVisits with backend filtering
export const getAllFollowUpVisits = async (filters: AppointmentFilters = {}) => {
  try {
    const params = new URLSearchParams();

    // Pagination
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    
    // Search (send to backend)
    if (filters.search) params.append('search', filters.search);
    
    // Status filtering (send active tab to backend)
    if (filters.tab && filters.tab !== 'all') {
      params.append('status', filters.tab);
    }
    
    // Time frame filtering
    if (filters.time_frame) params.append('time_frame', filters.time_frame);
    
    // Sorting
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);

    const queryString = params.toString();
    const url = queryString 
      ? `/patientrecords/follow-up-visits-all/?${queryString}`
      : "/patientrecords/follow-up-visits-all/";

    console.log('Fetching URL:', url);
    
    const res = await api2.get(url)
    return res.data || {count: 0, next: null, previous: null, results: []}
  } catch (error) {
    console.error("Error fetching all follow-up visits:", error)
    return {count: 0, next: null, previous: null, results: []}
  }
}


export const getAppointmentsByResidentId = async (rp_id: string) => {
  try {
    // You will need to create this endpoint in your backend
    const res = await api2.get(`patientrecords/appointments/by-resident/${rp_id}/`);
    return res.data || [];
  } catch (error) {
    console.error("Error fetching appointments by resident ID:", error);
    return [];
  }
};

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




  export const checkPatientExistsGet = async (rp_id: string): Promise<boolean> => {
    try {
        const res = await api2.get(`medicine/check-patient-exists/${rp_id}/`);
        if (res.status !== 200) {
            throw new Error("Failed to check patient existence");
        }
        console.log(res);
        return res.data; // Returns true or false
    } catch (error) {
        console.error("Error checking patient existence:", error);
        throw error;
    }
}


export const getChildData = async (id: any): Promise<any> => {
	try {
		const res = await api2.get(`child-health/records/by-patient/${id}/`);
		if (res.status !== 200) {
			throw new Error("Failed to fetch child data");
		}
		console.log(res);
		return res.data; // Returns child data
	} catch (error) {
		console.error("Error fetching child data:", error);
		throw error;
	}
}