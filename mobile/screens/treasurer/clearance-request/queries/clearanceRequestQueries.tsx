import { AxiosError } from "axios";
import { getClearanceRequests as getClearanceRequestsAPI, ClearanceRequest as APIClearanceRequest } from "../restful-api/clearanceRequestGetAPI";

// Enhanced types for web backend compatibility
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

// Enhanced fetch clearance requests with web backend data mapping
export const getClearanceRequests = async (): Promise<ClearanceRequest[]> => {
    try {
        console.log('Fetching clearance requests with web backend mapping...');
        const rawData = await getClearanceRequestsAPI();
        
        // Map the mobile API data to web backend format
        const mapped: ClearanceRequest[] = (rawData || []).map((item: any) => {
            return {
                cr_id: item.cr_id,
                resident_details: item.resident_details || {},
                req_pay_method: item.req_pay_method || 'Walk-in',
                req_request_date: item.cr_req_request_date || item.req_request_date,
                req_claim_date: item.cr_req_claim_date || item.req_claim_date,
                req_type: item.req_type || '',
                req_status: item.req_status || 'Pending',
                req_payment_status: item.cr_req_payment_status || item.req_payment_status,
                req_transac_id: item.req_transac_id || '',
                req_amount: item.req_amount || '0',
                req_purpose: item.req_purpose || '',
                invoice: item.invoice || undefined,
                payment_details: item.payment_details || undefined,
            } as ClearanceRequest;
        });
        
        console.log('Web backend mapped clearance requests:', mapped);
        return mapped;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error in clearance request queries:', error.response?.data || error.message);
        throw error;
    }
};

// Get payment statistics with enhanced calculation
export const getPaymentStatistics = async (): Promise<any> => {
    try {
        console.log('Calculating payment statistics...');
        const data = await getClearanceRequests();
        
        const statistics = {
            total_requests: data.length,
            paid_requests: data.filter((item: ClearanceRequest) => item.req_payment_status === 'Paid').length,
            unpaid_requests: data.filter((item: ClearanceRequest) => item.req_payment_status === 'Unpaid').length,
            partial_requests: data.filter((item: ClearanceRequest) => item.req_payment_status === 'Partial').length,
            overdue_requests: data.filter((item: ClearanceRequest) => item.req_payment_status === 'Overdue').length,
            pending_requests: data.filter((item: ClearanceRequest) => item.req_status === 'Pending').length
        };
        
        console.log('Payment statistics:', statistics);
        return statistics;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error calculating payment statistics:', error.response?.data || error.message);
        throw error;
    }
};

// Re-export other functions from API layer
export { 
    getClearanceRequestById, 
    searchClearanceRequests, 
    updatePaymentStatus 
} from '../restful-api/clearanceRequestGetAPI';
