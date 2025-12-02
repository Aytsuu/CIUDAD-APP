import { api } from "@/api/api";
import { AxiosError } from "axios";
import { z } from "zod";
import { ordinanceUploadFormSchema } from '@/form-schema/council/ordinanceUploadSchema';
import type { SupplementaryDoc } from './OrdinanceGetAPI';

// Backend API data structure (separate from frontend form schema)
export interface BackendOrdinanceData {
    ord_title: string;
    ord_details: string;
    ord_date_created: string;
    ord_category: string[];
    ord_year: number;
    staff_id: string; // Changed from 'staff' to 'staff_id' to match backend
}

// Transform frontend form data to backend API format
export const transformFormDataToBackend = (
    formData: z.infer<typeof ordinanceUploadFormSchema>, 
    staffId: string
): BackendOrdinanceData => {
    
    const result = {
        ord_title: formData.ordTitle || '',
        ord_details: formData.ordDetails || '',
        ord_date_created: formData.ordDate || new Date().toISOString().split('T')[0],
        ord_category: formData.ordAreaOfFocus || [],
        ord_year: new Date(formData.ordDate || new Date()).getFullYear(),
        staff_id: String(staffId), // Ensure staff_id is a string
    };
    
    return result;
};

// POST operations for ordinances
export const createOrdinance = async (data: BackendOrdinanceData) => {
    try {
        
        const response = await api.post('/council/ordinance/', data);
        
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('API Error creating ordinance:', error.response?.data);
            console.error('API Error status:', error.response?.status);
        }
        throw error;
    }
};

export const createSupplementaryDoc = async (data: Partial<SupplementaryDoc>) => {
    try {
        const response = await api.post('/council/ordinance-docs/', data);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error creating supplementary document:', error.response?.data);
        }
        throw error;
    }
};
