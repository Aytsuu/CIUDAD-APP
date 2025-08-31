import { api } from "@/api/api";
import { AxiosError } from "axios";

// Fetch certificates
export const getCertificates = async () => {
    try {
        console.log('Making request to /clerk/certificate/');
        const res = await api.get('/clerk/certificate/');
        console.log('API Response:', res.data);  // Log the response data
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching certificates:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;  // Re-throw the error so React Query can handle it
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