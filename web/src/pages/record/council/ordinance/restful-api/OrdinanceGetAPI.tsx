import { api } from "@/api/api";
import { AxiosError } from "axios";

// Types
export interface Ordinance {
    ord_num: string;
    ord_title: string;
    ord_date_created: string;
    ord_category: string;
    ord_details: string;
    ord_year: number;
    ord_is_archive: boolean;
    file: any;
    staff: any;
    supplementary_docs: SupplementaryDoc[];
}

export interface SupplementaryDoc {
    osd_id: number;
    osd_title: string;
    osd_is_archive: boolean;
    file: any;
}

// API Functions
export const getAllOrdinances = async () => {
    try {
        const response = await api.get('/secretary/ordinance/');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error fetching ordinances:', error.response?.data);
        }
        throw error;
    }
};

export const getOrdinanceById = async (id: string) => {
    try {
        const response = await api.get(`/secretary/ordinance/${id}/`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error fetching ordinance ${id}:`, error.response?.data);
        }
        throw error;
    }
};

export const createOrdinance = async (data: Partial<Ordinance>) => {
    try {
        const response = await api.post('/secretary/ordinance/', data);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error creating ordinance:', error.response?.data);
        }
        throw error;
    }
};

export const updateOrdinance = async (id: string, data: Partial<Ordinance>) => {
    try {
        const response = await api.put(`/secretary/ordinance/${id}/`, data);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error updating ordinance ${id}:`, error.response?.data);
        }
        throw error;
    }
};

export const deleteOrdinance = async (id: string) => {
    try {
        await api.delete(`/secretary/ordinance/${id}/`);
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error deleting ordinance ${id}:`, error.response?.data);
        }
        throw error;
    }
};

export const archiveOrdinance = async (id: string) => {
    try {
        const response = await api.post(`/secretary/ordinance/${id}/archive/`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error archiving ordinance ${id}:`, error.response?.data);
        }
        throw error;
    }
};

// Supplementary Document Functions
export const getAllSupplementaryDocs = async () => {
    try {
        const response = await api.get('/secretary/ordinance-docs/');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error fetching supplementary documents:', error.response?.data);
        }
        throw error;
    }
};

export const createSupplementaryDoc = async (data: Partial<SupplementaryDoc>) => {
    try {
        const response = await api.post('/secretary/ordinance-docs/', data);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error creating supplementary document:', error.response?.data);
        }
        throw error;
    }
};

export const archiveSupplementaryDoc = async (id: string) => {
    try {
        const response = await api.post(`/secretary/ordinance-docs/${id}/archive/`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error archiving supplementary document ${id}:`, error.response?.data);
        }
        throw error;
    }
}; 