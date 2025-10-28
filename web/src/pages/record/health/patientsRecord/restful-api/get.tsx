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


export const getChildren = async (id:string) => {
	try{
		const res = await api2.get(`/patientrecords/parent-children/${id}/`);
		return res.data || [];
	}catch(error){
		console.error("Error fetching children:", error);
		throw error;
	}
}
	

// fetch patient count
export const getPatientCount = async () => {
	try {
		const res = await api2.get('/patientrecords/patients/count/');
		return res.data;
	} catch (error) {
		console.error("Error fetching patient count:", error);
		throw error;
	}
}