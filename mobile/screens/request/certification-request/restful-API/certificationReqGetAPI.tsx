import { api } from "@/api/api";

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