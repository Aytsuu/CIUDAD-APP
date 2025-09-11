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

// Mark business permit as issued/printed
export const markBusinessPermitAsIssued = async (permitData: {
    bpr_id: string;
    file_url?: string;
    staff_id?: string;
}) => {
    try {
        console.log('Making request to /clerk/mark-business-permit-issued/');
        const res = await api.post('/clerk/mark-business-permit-issued/', permitData);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError;
        console.error('Error marking business permit as issued:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};
