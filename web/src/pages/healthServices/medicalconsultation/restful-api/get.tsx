import { api2 } from "@/api/api";

export const getPreviousBMI = async (id: string) => {
  try {
    const res = await api2.get(`/patientrecords/previous-measurement/${id}/`);

    return res.data;
  } catch (err: any) {
    console.error("Error fetching previous BMI:", err);
    if (err.response?.status === 404) {
      return null; // Return null instead of throwing error
    }

    throw err;
  }
};

export const getPatient = async () => {
  try {
    const response = await api2.get(`/patient`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

// Updated API functions
export const getMedicalRecord = async (params?: { page?: number; page_size?: number; search?: string; patient_type?: string }) => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.patient_type && params.patient_type !== "all") {
      queryParams.append("patient_type", params.patient_type);
    }

    const url = `/medical-consultation/all-medical-consultation-record/${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    const response = await api2.get(url);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};


export const getConsultationHistory = async (
  patientId?: string, 
  page?: number, 
  pageSize?: number, 
  searchQuery?: string,
  currentConsultationId?: number
): Promise<any> => {
  try {
    const params = new URLSearchParams();

    if (page !== undefined) params.append("page", page.toString());
    if (pageSize !== undefined) params.append("page_size", pageSize.toString());
    if (searchQuery?.trim()) params.append("search", searchQuery.trim());
    if (currentConsultationId !== undefined) params.append("current_consultation_id", currentConsultationId.toString());

    const url = `medical-consultation/view-medcon-record/${patientId ?? ""}/?${params.toString()}`;
    const response = await api2.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching consultation history:", error);
    throw error;
  }
};



export const getMedConPHHistory =async(pat_id:string)=>{
  try {
    const response = await api2.get(`patientrecords/patientPHIllnessCheck/${pat_id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching consultation history:", error);
    throw error;
  }
}


export const getFamHistory = async (pat_id: string, searchQuery?: string) => {
  try {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    const url = `/medical-consultation/family-medhistory/${pat_id}/${searchQuery ? `?${params.toString()}` : ''}`;
    const response = await api2.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching family history:", error);
    throw error;
  }
};


export const getpendingAppointments = async (page: number, pageSize: number, search: string = "", dateFilter: string = "all"): Promise<any> => {
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

    const response = await api2.get("/medical-consultation/pending-medicalcon-appointments/", { params: params });
    return response.data;
  } catch (error) {
    console.error("Error fetching processing medicine requests:", error);
    throw error;
  }
};





export const getconfirmedAppointments = async (page: number, pageSize: number, search: string = "", dateFilter: string = "all"): Promise<any> => {
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

    const response = await api2.get("/medical-consultation/confirmed-medicalcon-appointments/", { params: params });
    return response.data;
  } catch (error) {
    console.error("Error fetching processing medicine requests:", error);
    throw error;
  }
};

