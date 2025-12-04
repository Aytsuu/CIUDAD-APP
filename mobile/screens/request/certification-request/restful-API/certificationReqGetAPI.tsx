import { api } from "@/api/api";

// Fetch certificates
export const getCertificates = async () => {
    try {
        const res = await api.get('/clerk/certificate/');
        return res.data;
    } catch (err) {
        const error = err as any;
        throw error;
    }
};

// Fetch certificate by ID
export const getCertificateById = async (crId: string) => {
    try {
        const res = await api.get(`/clerk/certificate/${crId}/`);
        return res.data;
    } catch (err) {
        const error = err as any;
        throw error;
    }
};

// Search certificates
export const searchCertificates = async (query: string) => {
    try {
        const res = await api.get(`/clerk/certificate/?search=${encodeURIComponent(query)}`);
        return res.data;
    } catch (err) {
        const error = err as any;
        throw error;
    }
};

// Get personal clearances
export const getPersonalClearances = async () => {
    try {
        const res = await api.get('/clerk/personal-clearances/');
        return res.data;
    } catch (err) {
        const error = err as any;
        throw error;
    }
};

// Purpose and Rates API
export const getPurposeAndRates = async () => {
    try {
        const response = await api.get('/treasurer/purpose-and-rate/');
        // Ensure we return an array even if API format changes
        return response.data.results || response.data || [];
    } catch (error) {
        throw new Error("Failed to fetch purpose and rates");
    }
};

// Annual Gross Sales API - Fetch ALL records (handles pagination)
export const getAnnualGrossSales = async () => {
    try {
        let allResults: any[] = [];
        let nextUrl: string | null = null;
        let isFirstRequest = true;
        
        // First, try to fetch with large page size
        let response = await api.get('/treasurer/annual-gross-sales-active/', {
            params: {
                page: 1,
                page_size: 1000 // Large page size to get all records in one go
            }
        });
        
        let data = response.data;
        
        // Handle paginated response with results array
        if (data.results && Array.isArray(data.results)) {
            allResults = [...allResults, ...data.results];
            nextUrl = data.next;
        } 
        // Handle non-paginated response (direct array)
        else if (Array.isArray(data)) {
            return data;
        }
        // Handle response without results array (fallback)
        else {
            return data.results || data || [];
        }
        
        // If there are more pages, fetch them using the next URL
        while (nextUrl) {
            // Extract path from full URL if needed
            const urlToFetch = nextUrl.startsWith('http') 
                ? new URL(nextUrl).pathname + new URL(nextUrl).search
                : nextUrl;
            
            response = await api.get(urlToFetch);
            data = response.data;
            
            if (data.results && Array.isArray(data.results)) {
                allResults = [...allResults, ...data.results];
                nextUrl = data.next;
            } else {
                nextUrl = null;
            }
        }
        
        return allResults;
    } catch (error) {
        throw new Error("Failed to fetch annual gross sales");
    }
};

// Get all personal certification requests for a resident
export const getPersonalCertifications = async (residentId: string) => {
    try {
        const res = await api.get(`clerk/certificate/?rp=${residentId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
};

// Get all business permit requests for a resident
export const getBusinessPermitRequests = async (residentId: string) => {
    try {
        const res = await api.get(`clerk/business-permit/?rp=${residentId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
};

// Get all certification requests (both personal and business) for a resident
export const getAllCertificationRequests = async (residentId: string) => {
    try {
        const [personalCerts, businessPermits] = await Promise.all([
            getPersonalCertifications(residentId),
            getBusinessPermitRequests(residentId)
        ]);
        
        return {
            personal_certifications: personalCerts,
            business_permit_requests: businessPermits
        };
    } catch (err) {
        throw err;
    }
};

// Get specific personal certification by ID
export const getPersonalCertificationById = async (certId: string) => {
    try {
        const res = await api.get(`clerk/certificate/${certId}/`);
        return res.data;
    } catch (err) {
        throw err;
    }
};

// Get specific business permit request by ID
export const getBusinessPermitById = async (permitId: string) => {
    try {
        const res = await api.get(`clerk/business-permit/${permitId}/`);
        return res.data;
    } catch (err) {
        throw err;
    }
};

// Get certification request statistics for a resident
export const getCertificationStats = async (residentId: string) => {
    try {
        const allRequests = await getAllCertificationRequests(residentId);
        
        const stats = {
            total_requests: 0,
            pending_requests: 0,
            approved_requests: 0,
            rejected_requests: 0,
            personal_certifications: 0,
            business_permits: 0
        };

        // Count personal certifications
        if (allRequests.personal_certifications) {
            stats.personal_certifications = allRequests.personal_certifications.length;
            allRequests.personal_certifications.forEach((cert: any) => {
                stats.total_requests++;
                if (cert.req_status === 'Pending') stats.pending_requests++;
                else if (cert.req_status === 'Approved') stats.approved_requests++;
                else if (cert.req_status === 'Rejected') stats.rejected_requests++;
            });
        }

        // Count business permits
        if (allRequests.business_permit_requests) {
            stats.business_permits = allRequests.business_permit_requests.length;
            allRequests.business_permit_requests.forEach((permit: any) => {
                stats.total_requests++;
                if (permit.req_status === 'Pending') stats.pending_requests++;
                else if (permit.req_status === 'Approved') stats.approved_requests++;
                else if (permit.req_status === 'Rejected') stats.rejected_requests++;
            });
        }

        return stats;
    } catch (err) {
        throw err;
    }
};

// Get certification requests by status
export const getCertificationRequestsByStatus = async (residentId: string, status: string) => {
    try {
        const allRequests = await getAllCertificationRequests(residentId);
        const filteredRequests = {
            personal_certifications: [],
            business_permit_requests: []
        };

        if (allRequests.personal_certifications) {
            filteredRequests.personal_certifications = allRequests.personal_certifications.filter(
                (cert: any) => cert.req_status === status
            );
        }

        if (allRequests.business_permit_requests) {
            filteredRequests.business_permit_requests = allRequests.business_permit_requests.filter(
                (permit: any) => permit.req_status === status
            );
        }

        return filteredRequests;
    } catch (err) {
        throw err;
    }
};

// Business API - fetch business by resident profile ID or business respondent ID
export const getBusinessByResidentId = async (rpId: string, brId?: string) => {
    try {
        // Build query parameters in the same way as the working business module
        const params: Record<string, any> = {};
        if (rpId) {
            params.rp = rpId;
        }
        if (brId) {
            params.br = brId;
        }

        // Fetch business with address details using the same endpoint
        const response = await api.get('profiling/business/specific/ownership', {
            params,
        });

        const data = response.data;

        // Normalize response so callers can always read from .results
        if (Array.isArray(data)) {
            return {
                count: data.length,
                next: null,
                previous: null,
                results: data,
            };
        }

        if (data && Array.isArray(data.results)) {
            return data;
        }

        // Fallback: wrap single-object or unexpected shapes
        return {
            count: Array.isArray(data?.results) ? data.results.length : (data ? 1 : 0),
            next: null,
            previous: null,
            results: Array.isArray(data?.results)
                ? data.results
                : (data ? [data] : []),
        };
    } catch (error) {
        throw new Error("Failed to fetch business details");
    }
};

// Business Respondent API - fetch business respondent by br_id
export const getBusinessRespondentById = async (brId: string) => {
    try {
        const response = await api.get(`/profiling/business/respondent/${brId}/info/`);
        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch business respondent details");
    }
};

// Check if resident has voter ID
export const checkResidentVoterId = async (rpId: string, userPersonalData?: any): Promise<boolean> => {
    try {
        // First, check if voter_id is available in user personal data
        if (userPersonalData?.voter_id !== null && userPersonalData?.voter_id !== undefined) {
            return true;
        }
        if (userPersonalData?.voter) {
            return true;
        }

        if (!rpId) {
            return false;
        }

        // Try profiling residents table endpoint first
        try {
            const res = await api.get(`profiling/resident/list/table/`, { params: { rp: rpId } });
            const items = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.results) ? res.data.results : [];
            const match = items.find((r: any) => String(r?.rp_id) === String(rpId));
            
            if (match) {
                const v = match?.voter_id ?? match?.voter ?? match?.voterId ?? null;
                return v !== null && v !== undefined && v !== 0 && v !== false;
            }
        } catch (_) {
            // Fallback: try profiling resident personal detail
        }

        // Fallback: try profiling resident personal detail endpoint
        try {
            const resDetail = await api.get(`profiling/resident/personal/${rpId}/`);
            const data = resDetail?.data || {};
            return Boolean(data?.voter_id ?? data?.voter);
        } catch (_) {
            // If both fail, return false
            return false;
        }
    } catch (error) {
        return false;
    }
};