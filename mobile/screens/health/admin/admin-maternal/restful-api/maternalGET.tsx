import { api2 } from "@/api/api"

// interfaces
export interface MaternalPatientFilters {
  page?: number;
	page_size?: number;
	status?: string;
	search?: string;
}

// maternal-records
export const getMaternalRecords = async (filters: MaternalPatientFilters = {}) => {
  try {
    const params = new URLSearchParams();

    if(filters.page) params.append('page', filters.page.toString());
    if(filters.page_size) params.append('page_size', filters.page_size.toString());
    if(filters.status && filters.status !== 'All') params.append('status', filters.status);
    if(filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `maternal/maternal-patients/?${queryString}` : "maternal/maternal-patients/"

    const res = await api2.get(url);
    return res.data || {count: 0, next: null, previous: null, results: []};
  } catch (error) {
    console.error("Error fetching maternal records: ", error);
    return error || {count: 0, next: null, previous: null, results: []};
  }
}

// active pregnancies count
export const getMaternalCount = async () => {
  try {
    const res = await api2.get("maternal/counts/")
    return res.data || 0;
  } catch (error) {
    console.error("Error fetching active pregnancies count: ", error);
    throw error;
  }
}