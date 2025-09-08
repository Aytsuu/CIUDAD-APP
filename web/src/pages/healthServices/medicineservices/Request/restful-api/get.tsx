import { api2 } from "@/api/api";
import { MedicineRequestPendingResponse } from "../types";


// api.ts
export const getMedicineRequestProcessing = async (
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  dateFilter: string = "all"
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());
    if (search) {
      params.append("search", search);
    }
    if (dateFilter && dateFilter !== "all") {
      params.append("date_filter", dateFilter);
    }

    const response = await api2.get("/medicine/medicine-request/");
    return response.data;
  } catch (error) {
    console.error("Error fetching processing medicine requests:", error);
    throw error;
  }
};


export const getMedicineRequestItem = async () => {
  try {
    const response = await api2.get("/medicine/medicine-request-items/");
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine records:", error);
    throw error;
  }
};



export const getRequestItems = async (medreq_id: number, pat_id: string | null, rp_id: string | null) => {
  try {
    const params = { medreq_id, ...(pat_id && { pat_id }), ...(rp_id && { rp_id }) };
    const response = await api2.get(`/medicine/medicine-request-items/`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine request items:", error);
    throw error;
  }
};



// api.ts
export const getMedicineRequestPending = async (
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  dateFilter: string = "all"
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());
    if (search) {
      params.append("search", search);
    }
    if (dateFilter && dateFilter !== "all") {
      params.append("date_filter", dateFilter);
    }

    const response = await api2.get(`/medicine/medicine-request-pending/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending medicine requests:", error);
    throw error;
  }
};
// components/queries.tsx/fetch.ts
export const getMedicineRequestPendingItems = async (
  page?: number, 
  pageSize?: number,
  search?: string,
  dateFilter?: string
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);
    if (dateFilter && dateFilter !== 'all') params.append('date_filter', dateFilter);
    
    // CORRECTED: No ID needed in the URL
    const url = `inventory/medreq-items-pending/${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await api2.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending medicine requests:", error);
    throw error;
  }
};

