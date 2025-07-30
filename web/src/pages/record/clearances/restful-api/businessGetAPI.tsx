import { api } from "@/api/api";
import { AxiosError } from "axios";

// Fetch business permits
export const getBusinessPermit = async () => {
    try {
        const res = await api.get('/clerk/business-permit/');
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching business permits:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;  // Re-throw the error so React Query can handle it
    }
};
