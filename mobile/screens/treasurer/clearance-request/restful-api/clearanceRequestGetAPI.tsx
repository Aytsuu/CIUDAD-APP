import { api } from "@/api/api";
import { AxiosError } from "axios";
import { 
    ClearanceRequestByIdSchema, 
    SearchClearanceRequestSchema 
} from "@/form-schema/treasurer/clearance-request-schema";

// Types for API responses
export interface ClearanceRequest {
    cr_id: string;
    resident_details: {
        per_fname: string;
        per_lname: string;
        per_contact: string;
        per_email: string;
    };
    req_pay_method: string;
    req_request_date: string;
    req_claim_date: string;
    req_type: string;
    req_status: string;
    req_payment_status: string;
    req_transac_id: string;
    req_amount: string;
    req_purpose: string;
    invoice?: {
        inv_num: string;
        inv_serial_num: string;
        inv_date: string;
        inv_amount: string;
        inv_nat_of_collection: string;
        inv_status: string;
    };
    payment_details?: {
        payment_id: string;
        payment_date: string;
        payment_amount: string;
        payment_method: string;
        payment_status: string;
    };
}

// Fetch clearance requests
export const getClearanceRequests = async (): Promise<ClearanceRequest[]> => {
    try {
        console.log('Making request to /clerk/certificate/');
        const res = await api.get('/clerk/certificate/');
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching clearance requests:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Fetch clearance request by ID
export const getClearanceRequestById = async (crId: string): Promise<ClearanceRequest> => {
    try {
        // Validate input
        const validatedData = ClearanceRequestByIdSchema.parse({ cr_id: crId });
        
        console.log(`Making request to /clerk/certificate/${validatedData.cr_id}/`);
        const res = await api.get(`/clerk/certificate/${validatedData.cr_id}/`);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching clearance request by ID:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Search clearance requests
export const searchClearanceRequests = async (query: string): Promise<ClearanceRequest[]> => {
    try {
        // Validate input
        const validatedData = SearchClearanceRequestSchema.parse({ query });
        
        console.log(`Making search request to /clerk/certificate/?search=${validatedData.query}`);
        const res = await api.get(`/clerk/certificate/?search=${encodeURIComponent(validatedData.query)}`);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error searching clearance requests:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Update payment status
export const updatePaymentStatus = async (crId: string, paymentStatus: string): Promise<ClearanceRequest> => {
    try {
        console.log(`Making request to update payment status for ${crId} to ${paymentStatus}`);
        const res = await api.patch(`/clerk/certificate/${crId}/`, {
            req_payment_status: paymentStatus
        });
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error updating payment status:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Get payment statistics
export const getPaymentStatistics = async (): Promise<any> => {
    try {
        console.log('Making request to /clerk/certificate/');
        const res = await api.get('/clerk/certificate/');
        console.log('API Response:', res.data);
        
        // Calculate statistics from the data
        const data = res.data || [];
        const statistics = {
            total_requests: data.length,
            paid_requests: data.filter((item: any) => item.req_payment_status === 'Paid').length,
            unpaid_requests: data.filter((item: any) => item.req_payment_status === 'Unpaid').length,
            partial_requests: data.filter((item: any) => item.req_payment_status === 'Partial').length,
            overdue_requests: data.filter((item: any) => item.req_payment_status === 'Overdue').length,
            pending_requests: data.filter((item: any) => item.req_status === 'Pending').length
        };
        
        return statistics;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error fetching payment statistics:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
}; 