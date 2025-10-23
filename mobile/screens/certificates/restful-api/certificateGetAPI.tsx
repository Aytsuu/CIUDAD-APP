import { api } from "@/api/api";
import { AxiosError } from "axios";
import { 
    CertificateByIdSchema, 
    SearchCertificateSchema 
} from "@/form-schema/certificates/certificate-schema";

export interface Certificate {
    cr_id: string;
    resident_details: {
        per_fname: string;
        per_lname: string;
    };
    req_pay_method: string;
    req_request_date: string;
    req_claim_date: string;
    req_type: string;
    req_status: string;
    req_payment_status: string;
    req_transac_id: string;
    invoice?: {
        inv_num: string;
        inv_serial_num: string;
        inv_date: string;
        inv_amount: string;
        inv_nat_of_collection: string;
    };
}
// Fetch certificates with search and pagination - matching web version
export const getCertificates = async (
    search?: string, 
    page?: number, 
    pageSize?: number, 
    status?: string, 
    paymentStatus?: string,
    purpose?: string
): Promise<{results: Certificate[], count: number, next: string | null, previous: string | null}> => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (page) params.append('page', page.toString());
        if (pageSize) params.append('page_size', pageSize.toString());
        if (status) params.append('status', status);
        if (paymentStatus) params.append('payment_status', paymentStatus);
        if (purpose) params.append('purpose', purpose);
        
        const queryString = params.toString();
        const url = `/clerk/certificate/${queryString ? '?' + queryString : ''}`;
        
        console.log('Making request to:', url);
        const res = await api.get(url);
        console.log('API Response:', res.data);
        
        // Handle both paginated and non-paginated responses
        if (res.data.results) {
            return res.data;
        } else {
            return {
                results: res.data,
                count: res.data.length,
                next: null,
                previous: null
            };
        }
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching certificates:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Fetch certificate by ID
export const getCertificateById = async (crId: string): Promise<Certificate> => {
    try {
        // Validate input
        const validatedData = CertificateByIdSchema.parse({ cr_id: crId });
        
        console.log(`Making request to /clerk/certificate/${validatedData.cr_id}/`);
        const res = await api.get(`/clerk/certificate/${validatedData.cr_id}/`);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching certificate by ID:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Search certificates
export const searchCertificates = async (query: string): Promise<Certificate[]> => {
    try {
        // Validate input
        const validatedData = SearchCertificateSchema.parse({ query });
        
        console.log(`Making search request to /clerk/certificate/?search=${validatedData.query}`);
        const res = await api.get(`/clerk/certificate/?search=${encodeURIComponent(validatedData.query)}`);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error searching certificates:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Get personal clearances
export const getPersonalClearances = async (): Promise<any[]> => {
    try {
        console.log('Making request to /clerk/personal-clearances/');
        const res = await api.get('/clerk/personal-clearances/');
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching personal clearances:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
}; 