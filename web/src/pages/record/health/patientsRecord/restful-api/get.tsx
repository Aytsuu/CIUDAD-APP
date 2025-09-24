import { api2 } from "@/api/api"

// interfaces
export interface PatientFilters {
  page?: number;
	page_size?: number;
	status?: string;
	search?: string;
}

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
export const getPatients = async (filters: PatientFilters = {}) => {
    try {
		const params = new URLSearchParams();

		if(filters.page) params.append('page', filters.page.toString());
		if(filters.page_size) params.append('page_size', filters.page_size.toString());
		if(filters.status && filters.status !== 'All') params.append('status', filters.status);
		if(filters.search) params.append('search', filters.search);

		const queryString = params.toString();
		const url = queryString ? `/patientrecords/patient/view/create/?${queryString}` : "/patientrecords/patient/view/create/"

        const res = await api2.get(url);
        return res.data || {count: 0, next: null, previous: null, results: []}; 
    } catch (error) {
        console.error("Network Error:", error);
        return {count: 0, next: null, previous: null, results: []}; 
    }
};


// fetch patient details
export const getPatientDetails = async (patientId: string) => {
	try {
		const res = await api2.get(`patientrecords/patients/${patientId}/`)
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
		const res = await api2.get(`/child-health/records/by-patient/${id}/`);
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