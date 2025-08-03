import { AxiosError } from "axios";
import { api } from "@/api/api";

// Fetch issued certificates
export const getIssuedCertificates = async () => {
    try {
        console.log('Making request to /clerk/issued-certificates/');
        const res = await api.get('/clerk/issued-certificates/');
        console.log('API Response:', res.data);
        return res.data || []; // Return empty array if no data
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching issued certificates:', error);
        if (error.response?.status === 500) {
            // If server error (likely no data yet), return empty array
            console.log('No issued certificates found, returning empty array');
            return [];
        }
        throw error; // Re-throw other errors
    }
};
