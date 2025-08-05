import { api } from "@/api/api";
import { AxiosError } from "axios";
import { 
    IssuedCertificateByIdSchema, 
    SearchCertificateSchema 
} from "@/form-schema/certificates/certificate-schema";

// Types for API responses
export interface IssuedCertificate {
    ic_id: string;
    dateIssued: string;
    requester: string;
    purpose: string;
    fileUrl: string;
    file_details?: {
        file_id: string;
        file_name: string;
        file_type: string;
        file_path: string;
        file_url: string;
    };
}

// Fetch issued certificates
export const getIssuedCertificates = async (): Promise<IssuedCertificate[]> => {
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

// Fetch issued certificate by ID
export const getIssuedCertificateById = async (icId: string): Promise<IssuedCertificate> => {
    try {
        // Validate input
        const validatedData = IssuedCertificateByIdSchema.parse({ ic_id: icId });
        
        console.log(`Making request to /clerk/issued-certificates/${validatedData.ic_id}/`);
        const res = await api.get(`/clerk/issued-certificates/${validatedData.ic_id}/`);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching issued certificate by ID:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Search issued certificates
export const searchIssuedCertificates = async (query: string): Promise<IssuedCertificate[]> => {
    try {
        // Validate input
        const validatedData = SearchCertificateSchema.parse({ query });
        
        console.log(`Making search request to /clerk/issued-certificates/?search=${validatedData.query}`);
        const res = await api.get(`/clerk/issued-certificates/?search=${encodeURIComponent(validatedData.query)}`);
        console.log('API Response:', res.data);
        return res.data || [];
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error searching issued certificates:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
}; 