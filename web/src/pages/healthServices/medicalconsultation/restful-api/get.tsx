import { api2 } from "@/api/api";

export const getPreviousBMI = async (id: string) => {
  try {
    const res = await api2.get(`/patientrecords/previous-measurement/${id}/`);

    return res.data;
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching previous BMI:", err);
    }
    if (err.response?.status === 404) {
      return null; // Return null instead of throwing error
    }
    // Do not throw in production; only log in development
  }
};

export const getPatient = async () => {
  try {
    const response = await api2.get(`/patient`);
    return response.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
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
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    // Do not throw in production; only log in development
  }
};

export const getConsultationHistory = async (patientId?: string, page?: number, pageSize?: number, searchQuery?: string, currentConsultationId?: number): Promise<any> => {
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
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching consultation history:", error);
    }
    // Do not throw in production; only log in development
  }
};

export const getMedConPHHistory = async (pat_id: string) => {
  try {
    const response = await api2.get(`patientrecords/patientPHIllnessCheck/${pat_id}/`);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching consultation history:", error);
    }
    // Do not throw in production; only log in development
  }
};

export const getFamHistory = async (pat_id: string, searchQuery?: string) => {
  try {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.append("search", searchQuery);
    }

    const url = `/medical-consultation/family-medhistory/${pat_id}/${searchQuery ? `?${params.toString()}` : ""}`;
    const response = await api2.get(url);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching family history:", error);
    }
    // Do not throw in production; only log in development
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
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching processing medicine requests:", error);
    }
    // Do not throw in production; only log in development
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
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching processing medicine requests:", error);
    }
    // Do not throw in production; only log in development
  }
};
export const getAppointments = async (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  dateFilter?: string;
  statuses?: string[] | string;
  meridiems?: ("AM" | "PM")[] | string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append("page", params.page.toString());
    if (params.pageSize !== undefined) queryParams.append("page_size", params.pageSize.toString());

    if (params.search) {
      queryParams.append("search", params.search);
    }
    if (params.dateFilter && params.dateFilter !== "all") {
      queryParams.append("date_filter", params.dateFilter);
    }

    // Handle statuses
    if (params.statuses) {
      const statusArray = Array.isArray(params.statuses)
        ? params.statuses
        : String(params.statuses)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
      statusArray.forEach((status) => queryParams.append("status", status));
    }

    // Handle meridiems
    if (params.meridiems) {
      const meridiemArray = Array.isArray(params.meridiems)
        ? params.meridiems
        : String(params.meridiems)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
      meridiemArray.forEach((meridiem) => queryParams.append("meridiem", meridiem.toUpperCase()));
    }

    const response = await api2.get("/medical-consultation/medical-consultation-stats/", { params: queryParams });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching appointments:", error);
    }
    // Do not throw in production; only log in development
  }
};
