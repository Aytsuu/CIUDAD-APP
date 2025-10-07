import { api } from "@/api/api";
import { AxiosError } from "axios";
import type { AIAnalysisResponse } from "../services/HuggingFaceAIService";


export interface Ordinance {
    ord_num: string;
    ord_title: string;
    ord_date_created: string;
    ord_category: string;
    ord_details: string;
    ord_year: number;
    ord_is_archive: boolean;
    ord_repealed?: boolean;
    file?: any;
    staff?: any;
    ord_parent?: string; // ord_num of the parent ordinance (if this is an amendment)
    ord_is_ammend?: boolean;
    ord_ammend_ver?: number;
    aiAnalysisResult?: AIAnalysisResponse;
}

// New interface for grouped ordinances (folders)
export interface OrdinanceFolder {
    id: string; // Unique identifier for the folder
    baseOrdinance: Ordinance; // The original ordinance
    amendments: Ordinance[]; // All amendments to this ordinance
    totalOrdinances: number; // Total count of ordinances in this folder
    amendmentComparisonResult?: AIAnalysisResponse; // AI analysis result for comparing all amendments
}

export interface SupplementaryDoc {
    osd_id: number;
    osd_title: string;
    osd_is_archive: boolean;
    file: any;
}


export const getAllOrdinances = async (): Promise<Ordinance[]> => {
    try {
        const response = await api.get('/council/ordinance/');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error fetching ordinances:', error.response?.data);
        }
        throw error;
    }
};

export const getOrdinancesPaginated = async (
    page: number,
    pageSize: number,
    searchQuery?: string
): Promise<{ results: Ordinance[]; count: number; total_pages: number }> => {
    try {
        const response = await api.get('/council/ordinance/', {
            params: {
                page,
                page_size: pageSize,
                search: searchQuery
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error fetching paginated ordinances:', error.response?.data);
        }
        throw error;
    }
};

export const getOrdinanceById = async (id: string) => {
    try {
        const response = await api.get(`/council/ordinance/${id}/`);
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
        const response = await api.post('/council/ordinance/', data);
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
        const response = await api.put(`/council/ordinance/${id}/`, data);
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
        await api.delete(`/council/ordinance/${id}/`);
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error deleting ordinance ${id}:`, error.response?.data);
        }
        throw error;
    }
};

export const archiveOrdinance = async (id: string) => {
    try {
        const response = await api.post(`/council/ordinance/${id}/archive/`);
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
        const response = await api.get('/council/ordinance-docs/');
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
        const response = await api.post('/council/ordinance-docs/', data);
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
        const response = await api.post(`/council/ordinance-docs/${id}/archive/`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Error archiving supplementary document ${id}:`, error.response?.data);
        }
        throw error;
    }
};

// Helper function to group ordinances into folders
export const groupOrdinancesIntoFolders = (ordinances: Ordinance[]): OrdinanceFolder[] => {
    console.log('Grouping ordinances into folders:', ordinances);
    const folders: Map<string, OrdinanceFolder> = new Map();
    const processedOrdinances = new Set<string>();
    
    // First pass: Create folders for ordinances that have amendments or are amendments
    ordinances.forEach(ordinance => {
        // Skip if already processed
        if (processedOrdinances.has(ordinance.ord_num)) return;
        
        // Check if this ordinance has amendments
        const hasAmendments = ordinances.some(ord => 
            ord.ord_parent === ordinance.ord_num && ord.ord_num !== ordinance.ord_num
        );
        
        // Check if this ordinance is an amendment
        const isAmendment = ordinance.ord_parent && ordinance.ord_parent !== ordinance.ord_num;
        
        console.log(`Processing ordinance ${ordinance.ord_num}:`, {
            hasAmendments,
            isAmendment,
            ord_parent: ordinance.ord_parent
        });
        
        // Only create a folder if this ordinance has amendments or is part of an amendment chain
        if (hasAmendments || isAmendment) {
            // Find the base ordinance (either this one or its parent)
            const baseOrdinanceId = isAmendment ? ordinance.ord_parent! : ordinance.ord_num;
            
            if (!folders.has(baseOrdinanceId)) {
                const folderId = `folder-${baseOrdinanceId}`;
                folders.set(baseOrdinanceId, {
                    id: folderId, // Unique folder ID
                    baseOrdinance: ordinances.find(ord => ord.ord_num === baseOrdinanceId)!,
                    amendments: [],
                    totalOrdinances: 1
                });
                console.log(`Created amendment folder with ID: ${folderId}`);
            }
            
            // Mark as processed
            processedOrdinances.add(ordinance.ord_num);
        }
    });
    
    // Second pass: Add amendments to their parent folders
    ordinances.forEach(ordinance => {
        if (ordinance.ord_parent && ordinance.ord_parent !== ordinance.ord_num) {
            const parentId = ordinance.ord_parent;
            const parentFolder = folders.get(parentId);
            
            if (parentFolder) {
                parentFolder.amendments.push(ordinance);
                parentFolder.totalOrdinances = parentFolder.amendments.length + 1;
                processedOrdinances.add(ordinance.ord_num);
                console.log(`Added amendment ${ordinance.ord_num} to parent folder ${parentId}`);
            }
        }
    });
    
    // Third pass: Create standalone folders for ordinances that aren't part of any chain
    ordinances.forEach(ordinance => {
        if (!processedOrdinances.has(ordinance.ord_num)) {
            const standaloneId = `standalone-${ordinance.ord_num}`;
            folders.set(standaloneId, {
                id: standaloneId, // Unique standalone folder ID
                baseOrdinance: ordinance,
                amendments: [],
                totalOrdinances: 1
            });
            processedOrdinances.add(ordinance.ord_num);
            console.log(`Created standalone folder with ID: ${standaloneId}`);
        }
    });
    
    const result = Array.from(folders.values());
    console.log('Final created folders:', result.map(f => ({ id: f.id, baseId: f.baseOrdinance.ord_num, amendments: f.amendments.length })));
    return result;
};

// Helper function to check if an ordinance is part of a folder
export const isOrdinanceInFolder = (ordinance: Ordinance): boolean => {
    return !!(ordinance.ord_parent || (ordinance.ord_ammend_ver && ordinance.ord_ammend_ver > 0));
};

// Helper function to get all ordinances in a folder
export const getOrdinancesInFolder = (folder: OrdinanceFolder): Ordinance[] => {
    return [folder.baseOrdinance, ...folder.amendments];
}; 