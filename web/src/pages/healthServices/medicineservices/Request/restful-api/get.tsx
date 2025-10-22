import { api2 } from "@/api/api";

// api.ts
export const getMedicineRequestProcessing = async (page:number, pageSize: number, search: string = "", dateFilter: string ): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());
    if (search) {
      params.append("search", search);
    }
    if (dateFilter && dateFilter != "all") {
      params.append("date_filter", dateFilter);
    }

   const response = await api2.get("/medicine/confirmed-medicine-request-table/", {
      params: params
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching processing medicine requests:", error);
    throw error;
  }
};


// api.ts
export const getMedicineRequestPending = async (page: number = 1, pageSize: number, search: string = "", dateFilter: string ): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());
    if (search) {
      params.append("search", search);
    }
    if (dateFilter && dateFilter != "all") {
      params.append("date_filter", dateFilter);
    }
    const response = await api2.get(`/medicine/pending-medicine-request-table/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending medicine requests:", error);
    throw error;
  }
};

export const getMedicineRequestPendingItems = async (id: string, page?: number, pageSize?: number): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    const url = `medicine/pending-medreq-items-table/${id}/${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await api2.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending medicine requests:", error);
    throw error;
  }
};


export const getMedicineRequestStatuses = async (page?: number , pageSize?: number, search?: string, dateFilter?: string, status?: any ): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    if (search) {
      params.append("search", search);
    }
    if (dateFilter && dateFilter !== "") {
      params.append("date_filter", dateFilter);
    }
    if (status) {
      params.append("status", status);
    }
    const response = await api2.get(`/medicine/medicine-requests-statuses/table/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending medicine requests:", error);
    throw error;
  }
};


export const getMedicineRequestStatusesDetails = async (medreq_id?:string ,page?: number , pageSize?: number, status?: any ): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
  
    if (status) {
      params.append("status", status);
    }
    const response = await api2.get(`/medicine/medicine-requests-statuses/details/${medreq_id}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending medicine requests:", error);
    throw error;
  }
};