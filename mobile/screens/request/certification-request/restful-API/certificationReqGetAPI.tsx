import { api } from "@/api/api";

// Fetch certificates
export const getCertificates = async () => {
    try {
        console.log('Making request to /clerk/certificate/');
        const res = await api.get('/clerk/certificate/');
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as any;
        console.error('Error fetching certificates:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Fetch certificate by ID
export const getCertificateById = async (crId: string) => {
    try {
        console.log(`Making request to /clerk/certificate/${crId}/`);
        const res = await api.get(`/clerk/certificate/${crId}/`);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as any;
        console.error('Error fetching certificate by ID:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Search certificates
export const searchCertificates = async (query: string) => {
    try {
        console.log(`Making search request to /clerk/certificate/?search=${query}`);
        const res = await api.get(`/clerk/certificate/?search=${encodeURIComponent(query)}`);
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as any;
        console.error('Error searching certificates:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

// Get personal clearances
export const getPersonalClearances = async () => {
    try {
        console.log('Making request to /clerk/personal-clearances/');
        const res = await api.get('/clerk/personal-clearances/');
        console.log('API Response:', res.data);
        return res.data;
    } catch (err) {
        const error = err as any;
        console.error('Error fetching personal clearances:', error);
        console.error('Error details:', error.response?.data || 'No error details available');
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
        console.error("Failed to fetch purpose and rates:", error);
        throw new Error("Failed to fetch purpose and rates");
    }
};

// Annual Gross Sales API
export const getAnnualGrossSales = async () => {
    try {
        const response = await api.get('/treasurer/annual-gross-sales-active/');
        // The API returns paginated data with results array
        return response.data.results || response.data || [];
    } catch (error) {
        console.error("Failed to fetch annual gross sales:", error);
        throw new Error("Failed to fetch annual gross sales");
    }
};

// Get all personal certification requests for a resident
export const getPersonalCertifications = async (residentId: string) => {
    try {
        const res = await api.get(`clerk/certificate/?rp=${residentId}`);
        return res.data;
    } catch (err) {
        console.error("Error fetching personal certifications:", err);
        throw err;
    }
};

// Get all business permit requests for a resident
export const getBusinessPermitRequests = async (residentId: string) => {
    try {
        const res = await api.get(`clerk/business-permit/?rp=${residentId}`);
        return res.data;
    } catch (err) {
        console.error("Error fetching business permit requests:", err);
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
        console.error("Error fetching all certification requests:", err);
        throw err;
    }
};

// Get specific personal certification by ID
export const getPersonalCertificationById = async (certId: string) => {
    try {
        const res = await api.get(`clerk/certificate/${certId}/`);
        return res.data;
    } catch (err) {
        console.error("Error fetching personal certification by ID:", err);
        throw err;
    }
};

// Get specific business permit request by ID
export const getBusinessPermitById = async (permitId: string) => {
    try {
        const res = await api.get(`clerk/business-permit/${permitId}/`);
        return res.data;
    } catch (err) {
        console.error("Error fetching business permit by ID:", err);
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
        console.error("Error fetching certification stats:", err);
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
        console.error("Error fetching certification requests by status:", err);
        throw err;
    }
};

// Business API - fetch business by resident profile ID
export const getBusinessByResidentId = async (rpId: string) => {
    try {
        // Fetch business with address details using the correct endpoint
        const response = await api.get(`/profiling/business/specific/ownership/?rp=${rpId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch business by resident ID:", error);
        throw new Error("Failed to fetch business details");
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
        console.error("Error checking resident voter ID:", error);
        return false;
    }
};