import { api } from "@/api/api";
import { AxiosError } from "axios";

// Types
export interface OrdinanceTemplate {
    template_id: number;
    title: string;
    template_body: string;
    with_seal: boolean;
    with_signature: boolean;
    pdf_url?: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

// API Functions
export const getAllTemplates = async () => {
    try {
        const response = await api.get('/council/templates/');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error fetching templates:', error.response?.data);
        }
        throw error;
    }
};

export const getTemplateById = async (id: number) => {
    try {
        const response = await api.get(`/council/templates/${id}/`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error fetching template ${id}:`, error.response?.data);
        }
        throw error;
    }
};

export const createTemplate = async (formData: FormData) => {
    try {
        const response = await api.post('/council/templates/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error creating template:', error.response?.data);
        }
        throw error;
    }
};

export const updateTemplate = async (id: number, formData: FormData) => {
    try {
        const response = await api.put(`/council/templates/${id}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error updating template ${id}:`, error.response?.data);
        }
        throw error;
    }
};

export const deleteTemplate = async (id: number) => {
    try {
        await api.delete(`/council/templates/${id}/`);
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error deleting template ${id}:`, error.response?.data);
        }
        throw error;
    }
};

export const archiveTemplate = async (id: number) => {
    try {
        const response = await api.post(`/council/templates/${id}/archive/`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error archiving template ${id}:`, error.response?.data);
        }
        throw error;
    }
}; 