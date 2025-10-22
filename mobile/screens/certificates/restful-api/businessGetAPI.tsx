import { api } from "@/api/api";
import { AxiosError } from "axios";
import { 
    BusinessPermitByIdSchema, 
    SearchCertificateSchema 
} from "@/form-schema/certificates/certificate-schema";


export interface BusinessPermit {
    bp_id: string;
    business_name: string;
    business_type: string;
    owner_name: string;
    business_address: string;
    req_pay_method: string;
    req_request_date: string;
    req_claim_date: string;
    req_status: string;
    req_payment_status: string;
    req_transac_id: string;
    pr_id?: string;
    ra_id?: string;
    staff_id?: string;
    rp?: string;
}

export interface IssuedBusinessPermit {
    ibp_id: string;
    dateIssued: string;
    business_name: string;
    owner_name: string;
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

// Fetch business permits with search and pagination - matching web version
export const getBusinessPermits = async (
    search?: string,
    page?: number,
    pageSize?: number,
    status?: string,
    paymentStatus?: string,
    businessType?: string
): Promise<{results: BusinessPermit[], count: number, next: string | null, previous: string | null}> => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (page) params.append('page', page.toString());
        if (pageSize) params.append('page_size', pageSize.toString());
        if (status) params.append('status', status);
        if (paymentStatus) params.append('payment_status', paymentStatus);
        if (businessType) params.append('business_type', businessType);
        
        const queryString = params.toString();
        const url = `/clerk/business-permit/${queryString ? '?' + queryString : ''}`;
        
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
        console.error('Error fetching business permits:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Fetch business permit by ID
export const getBusinessPermitById = async (bpId: string): Promise<BusinessPermit> => {
    try {
        // Validate input
        const validatedData = BusinessPermitByIdSchema.parse({ bp_id: bpId });
        
        console.log(`Making request to /clerk/business-permit/${validatedData.bp_id}/`);
        const res = await api.get(`/clerk/business-permit/${validatedData.bp_id}/`);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching business permit by ID:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Fetch issued business permits with search and pagination - matching web version
export const getIssuedBusinessPermits = async (
    search?: string,
    page?: number,
    pageSize?: number,
    purpose?: string,
    dateFrom?: string,
    dateTo?: string
): Promise<{results: IssuedBusinessPermit[], count: number, next: string | null, previous: string | null}> => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (page) params.append('page', page.toString());
        if (pageSize) params.append('page_size', pageSize.toString());
        if (purpose) params.append('purpose', purpose);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        
        const queryString = params.toString();
        const url = `/clerk/issued-business-permits/${queryString ? '?' + queryString : ''}`;
        
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
        console.error('Error fetching issued business permits:', error);
        if (error.response?.status === 500) {
            console.log('No issued business permits found, returning empty array');
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

// Search business permits
export const searchBusinessPermits = async (query: string): Promise<BusinessPermit[]> => {
    try {
        // Validate input
        const validatedData = SearchCertificateSchema.parse({ query });
        
        console.log(`Making search request to /clerk/business-permit/?search=${validatedData.query}`);
        const res = await api.get(`/clerk/business-permit/?search=${encodeURIComponent(validatedData.query)}`);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error searching business permits:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Get permit clearances
export const getPermitClearances = async (): Promise<any[]> => {
    try {
        console.log('Making request to /clerk/permit-clearances/');
        const res = await api.get('/clerk/permit-clearances/');
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching permit clearances:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
}; 