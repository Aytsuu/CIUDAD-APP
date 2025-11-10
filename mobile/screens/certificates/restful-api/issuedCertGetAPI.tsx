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

// Fetch issued certificates with search and pagination - matching web version
export const getIssuedCertificates = async (
    search?: string,
    page?: number,
    pageSize?: number,
    purpose?: string,
    dateFrom?: string,
    dateTo?: string
): Promise<{results: IssuedCertificate[], count: number, next: string | null, previous: string | null}> => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (page) params.append('page', page.toString());
        if (pageSize) params.append('page_size', pageSize.toString());
        if (purpose) params.append('purpose', purpose);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        
        const queryString = params.toString();
        const url = `/clerk/issued-certificates/${queryString ? '?' + queryString : ''}`;
        
        console.log('Making request to:', url);
        const res = await api.get(url);
        console.log('API Response:', res.data);
        
        // Handle both paginated and non-paginated responses
        if (res.data.results) {
            return res.data;
        } else {
            return {
                results: res.data || [],
                count: res.data?.length || 0,
                next: null,
                previous: null
            };
        }
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching issued certificates:', error);
        if (error.response?.status === 500) {
            console.log('No issued certificates found, returning empty array');
            return {
                results: [],
                count: 0,
                next: null,
                previous: null
            };
        }
        throw error;
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