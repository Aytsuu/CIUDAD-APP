import { api } from "@/api/api";

export interface OrdinanceData {
    ord_num: string;
    ord_title: string;
    ord_date_created: string;
    ord_category: string;
    ord_details: string;
    ord_year: number;
    ord_is_archive: boolean;
    ord_repealed?: boolean;
    file?: {
        file_id: number;
        file_url: string;
        file_name?: string;
    };
    staff?: any;
    staff_id?: string;
    ord_parent?: string;
    ord_is_ammend?: boolean;
    ord_ammend_ver?: number;
}

export const getOrdinances = async (
    page: number = 1, 
    pageSize: number = 10,
    searchQuery?: string, 
    categoryFilter?: string, 
    yearFilter?: string,
    isArchive?: boolean
): Promise<{ results: OrdinanceData[]; count: number; total_pages: number }> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        if (categoryFilter && categoryFilter !== "all") params.category = categoryFilter;
        if (yearFilter && yearFilter !== "all") params.year = yearFilter;
        if (isArchive !== undefined) params.is_archive = isArchive;
        
        const res = await api.get('council/ordinance/', { params });
        
        // Handle paginated response
        if (res.data.results !== undefined) {
            return {
                results: res.data.results || [],
                count: res.data.count || 0,
                total_pages: res.data.total_pages || 1
            };
        }
        
        // Fallback for non-paginated response
        return {
            results: Array.isArray(res.data) ? res.data : [],
            count: Array.isArray(res.data) ? res.data.length : 0,
            total_pages: 1
        };
    } catch (err) {
        return { results: [], count: 0, total_pages: 1 };
    }
};

// Create new ordinance
export const createOrdinance = async (data: any) => {
    try {
        const response = await api.post('council/ordinance/', data);
        return response.data;
    } catch (err) {
        throw err;
    }
};

// Update ordinance
export const updateOrdinance = async (id: string, data: Partial<OrdinanceData>) => {
    try {
        const response = await api.put(`council/ordinance/${id}/`, data);
        return response.data;
    } catch (err) {
        throw err;
    }
};

// Delete ordinance
export const deleteOrdinance = async (id: string) => {
    try {
        await api.delete(`council/ordinance/${id}/`);
    } catch (err) {
        throw err;
    }
};

// Upload ordinance with file
export const uploadOrdinance = async (formData: FormData) => {
    try {
        const response = await api.post('council/ordinance/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (err) {
        throw err;
    }
};

// Helper function to group ordinances into folders (same as web)
export const groupOrdinancesIntoFolders = (ordinances: OrdinanceData[]): any[] => {
    const folders: Map<string, any> = new Map();
    const processedOrdinances = new Set<string>();
    
    // First pass: Create folders for ordinances that have amendments or are amendments
    ordinances.forEach(ordinance => {
        if (processedOrdinances.has(ordinance.ord_num)) return;
        
        const hasAmendments = ordinances.some(ord => 
            ord.ord_parent === ordinance.ord_num && ord.ord_num !== ordinance.ord_num
        );
        
        const isAmendment = ordinance.ord_parent && ordinance.ord_parent !== ordinance.ord_num;
        
        if (hasAmendments || isAmendment) {
            const baseOrdinanceId = isAmendment ? ordinance.ord_parent! : ordinance.ord_num;
            
            if (!folders.has(baseOrdinanceId)) {
                const folderId = `folder-${baseOrdinanceId}`;
                folders.set(baseOrdinanceId, {
                    id: folderId,
                    baseOrdinance: ordinances.find(ord => ord.ord_num === baseOrdinanceId)!,
                    amendments: [],
                    totalOrdinances: 1
                });
            }
            
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
            }
        }
    });
    
    // Third pass: Create standalone folders for ordinances that aren't part of any chain
    ordinances.forEach(ordinance => {
        if (!processedOrdinances.has(ordinance.ord_num)) {
            const standaloneId = `standalone-${ordinance.ord_num}`;
            folders.set(standaloneId, {
                id: standaloneId,
                baseOrdinance: ordinance,
                amendments: [],
                totalOrdinances: 1
            });
            processedOrdinances.add(ordinance.ord_num);
        }
    });
    
    return Array.from(folders.values());
};

