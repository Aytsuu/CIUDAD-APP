import { api2 } from "@/api/api";
import { useQuery } from "@tanstack/react-query";


export interface AppointmentItem {
  id: number;
  chief_complaint: string;
  scheduled_date: string;
  meridiem: string;
  status: string;
  created_at: string;
  archive_reason?: string | null;
}

export interface AppointmentsResponse {
  results: AppointmentItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

// API Functions
export const getUserAppointments = async (
  rpId: string, 
  status?: string, 
  search?: string,
  page?: number, 
  pageSize?: number
): Promise<AppointmentsResponse> => {
  if (!rpId) {
    throw new Error('User ID is required');
  }
  
  const params = new URLSearchParams();
  params.append('rp_id', rpId);
  params.append('include_archived', 'true'); // Always include archived for complete data
  
  if (status && status !== 'all') params.append('status', status);
  if (search && search.trim()) params.append('search', search.trim());
  if (page) params.append('page', page.toString());
  if (pageSize) params.append('page_size', pageSize.toString());
  
  const response = await api2.get(`/medical-consultation/user-appointments/?${params.toString()}`);
  
  console.log('API Response (Filtered Appointments):', response.data);
  
  return {
    results: response.data.results || [],
    count: response.data.count || 0,
    next: response.data.next || null,
    previous: response.data.previous || null,
  };
};

export const useUserAppointments = (
  rpId: string, 
  status?: string, 
  search?: string,
  page?: number, 
  pageSize?: number
) => {
  return useQuery<AppointmentsResponse>({
    queryKey: ['userAppointments', rpId, status, search, page, pageSize],
    queryFn: () => getUserAppointments(rpId, status, search, page, pageSize),
    enabled: !!rpId,
    staleTime: 5 * 60 * 1000,
  });
};


export const getConsultationHistory = async (patientId?: string, page?: number, pageSize?: number, searchQuery?: string): Promise<any> => {
    try {
      const params = new URLSearchParams();
  
      if (page !== undefined) params.append("page", page.toString());
      if (pageSize !== undefined) params.append("page_size", pageSize.toString());
      if (searchQuery?.trim()) params.append("search", searchQuery.trim());
  
      // FIX: Add leading slash AND timeout
      const url = `/medical-consultation/view-medcon-record/${patientId ?? ""}/?${params.toString()}`;
      
      console.log("Fetching consultation history from:", url);
      
      const response = await api2.get(url, { 
        timeout: 30000 // 30 seconds
      });
      
      console.log("Consultation history response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching consultation history:", error);
      
      // Better error logging
      if (error.code === 'ECONNABORTED') {
        console.error("Request timeout - consultation endpoint is too slow");
      } else if (error.response) {
        console.error("Server error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No response received - server might be down or endpoint doesn't exist");
      }
      
      throw error;
    }
  };

export const useConsultationHistory = (patientId?: string, page?: number, pageSize?: number, searchQuery?: string) => {
    console.log("useConsultationHistory hook initialized with:", { patientId, page, pageSize, searchQuery });
    return useQuery<any>({
        queryKey: ["consultationHistory", patientId, page, pageSize, searchQuery],
        queryFn: () => getConsultationHistory(patientId, page, pageSize, searchQuery),
        enabled: !!patientId
    });
};

export const getFamHistory = async (pat_id: string, searchQuery?: string) => {
    console.log("getFamHistory called with:", { pat_id, searchQuery });
    try {
        const params = new URLSearchParams();
        if (searchQuery) {
            params.append("search", searchQuery);
        }

        const url = `/medical-consultation/family-medhistory/${pat_id}/${searchQuery ? `?${params.toString()}` : ""}`;
        const response = await api2.get(url);
        console.log("-------------------------jnsdjsndjsdnjsd----",response.data);

        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error("Server responded with an error:", error.response.data);
        } else if (error.request) {
            console.error("No response received from server:", error.request);
        } else {
            console.error("Error setting up the request:", error.message);
        }
        throw error;
    }
};

export const useFamHistory = (pat_id: string, searchQuery?: string) => {
    console.log("useFamHistory hook initialized with:", { pat_id, searchQuery });
    return useQuery({
        queryKey: ["familyHistory", pat_id, searchQuery],
        queryFn: () => getFamHistory(pat_id, searchQuery),
        staleTime: 1000 * 60 * 5,
        enabled: !!pat_id,
    });
};

export const getPrenatalPatientMedHistory = async (patientId: string, search?: string) => {
    console.log("getPrenatalPatientMedHistory called with:", { patientId, search });
    try {
        const params: any = {};
        if (search) {
            params.search = search;
        }

        const res = await api2.get(`maternal/patient/${patientId}/medicalhistory/`, { params });
        console.log("--------------------MRDICSL VON---------",res.data);
        return res.data || [];
    } catch (error: any) {
        if (error.response) {
            console.error("Server responded with an error:", error.response.data);
        } else if (error.request) {
            console.error("No response received from server:", error.request);
        } else {
            console.error("Error setting up the request:", error.message);
        }
        throw error;
    }
};

export const usePrenatalPatientMedHistory = (patientId: string, search?: string) => {
    console.log("usePrenatalPatientMedHistory hook initialized with:", { patientId, search });
    return useQuery({
        queryKey: ["prenatalPatientMedHistory", patientId, search],
        queryFn: () => getPrenatalPatientMedHistory(patientId, search),
        enabled: !!patientId,
        staleTime: 1000 * 60 * 5,
        // refetchOnWindowFocus: true,
    });
};



export const cancelAppointment = async (appointment_id: number, reason: string): Promise<void> => {
  try {
    console.log(`Cancelling appointment ${appointment_id} with reason:`, reason);
    
    const response = await api2.patch(
      `/medical-consultation/cancel-appointment/${appointment_id}/`, 
      { archive_reason: reason },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('Cancel appointment response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Server response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    throw error;
  }
};
