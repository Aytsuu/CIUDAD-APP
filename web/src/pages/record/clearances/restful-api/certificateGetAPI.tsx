import { api } from "@/api/api";
import { AxiosError } from "axios";

// Fetch certificates with search and pagination
export const getCertificates = async (search?: string, page?: number, pageSize?: number, status?: string, purpose?: string, paymentStatus?: string) => {
    try {
        const params = new URLSearchParams();
        if (search) {
            params.append('search', search);
        }
        if (page) {
            params.append('page', page.toString());
        }
        if (pageSize) {
            params.append('page_size', pageSize.toString());
        }
        if (status) {
            params.append('status', status);
        }
        if (purpose) {
            params.append('purpose', purpose);
        }
        if (paymentStatus) {
            params.append('payment_status', paymentStatus);
        }
        
        const queryString = params.toString();
        const url = `/clerk/certificate-combined/${queryString ? '?' + queryString : ''}`;
        
        console.log('Making request to:', url);
        const res = await api.get(url);
        console.log('API Response:', res.data);
        
        // Debug: Check if per_mname is in the response
        if (res.data.results && res.data.results.length > 0) {
            const firstCert = res.data.results[0];
            console.log('First certificate resident_details:', firstCert.resident_details);
            console.log('per_mname in API response:', firstCert.resident_details?.per_mname);
        }
        
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching certificates:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Mark certificate as issued/printed
export const markCertificateAsIssued = async (certificateData: {
    cr_id: string;
    file_url?: string;
    staff_id?: string;
}) => {
    try {
        console.log('Making request to /clerk/mark-certificate-issued/');
        const res = await api.post('/clerk/mark-certificate-issued/', certificateData);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error marking certificate as issued:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};



export type Staff = {
  staff_id: string;
  full_name: string;
  position_title: string;
};

export const getStaffList = async (): Promise<Staff[]> => {
  try {
    const res = await api.get("council/api/staff");

    return res.data
      .map((item: any) => {
        // Normalize ID to uppercase and ensure string type
        const staffId = String(item.staff_id || "")
          .toUpperCase()
          .trim();

        if (!staffId) {
          return null;
        }

        return {
          staff_id: staffId, // Store as uppercase
          full_name: item.full_name?.trim() || `Staff ${staffId}`,
          position_title: item.position_title?.trim() || "No Designation",
        };
      })
      .filter(Boolean);
  } catch (err) {
    return [];
  }
};