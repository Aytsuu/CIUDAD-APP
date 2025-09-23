import { api2 } from "@/api/api"

// interfaces
export interface PatientFilters {
  page?: number;
	page_size?: number;
	status?: string;
	search?: string;
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
