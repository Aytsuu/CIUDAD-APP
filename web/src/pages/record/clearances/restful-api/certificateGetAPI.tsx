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
