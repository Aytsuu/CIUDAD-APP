import { api } from "@/api/api";


export const getPersonalClearances = async () => {
    try {
        const response = await api.get('/clerk/personal-clearances/');
        return response.data
    } catch (error: any) {
        console.error("Failed to fetch personal clearances:", error);
        throw new Error(error.response?.data?.detail || "Failed to fetch personal clearances");
    }
};

// Fetch personal clearances from TREASURER endpoint (alternative)
export const getPersonalClearancesFromTreasurer = async () => {
    try {
        const response = await api.get('/treasurer/clearance-request/');
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch personal clearances from treasurer:", error);
        throw new Error(error.response?.data?.detail || "Failed to fetch personal clearances from treasurer");
    }
};

// Get specific clearance by ID from CLERK
export const getPersonalClearanceById = async (crId: string) => {
    try {
        const response = await api.get(`/clerk/certificate/${crId}/`);
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch personal clearance by ID:", error);
        throw new Error(error.response?.data?.detail || "Failed to fetch personal clearance by ID");
    }
};

// Get specific clearance by ID from TREASURER (alternative)
export const getPersonalClearanceByIdFromTreasurer = async (crId: string) => {
    try {
        const response = await api.get(`/treasurer/clearance-request/${crId}/`);
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch personal clearance by ID from treasurer:", error);
        throw new Error(error.response?.data?.detail || "Failed to fetch personal clearance by ID from treasurer");
    }
};

// Update payment status via CLERK
export const updatePaymentStatus = async (crId: string, paymentStatus: string) => {
    try {
        const response = await api.patch(`/clerk/certificate/${crId}/`, {
            payment_status: paymentStatus
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to update payment status:", error);
        throw new Error(error.response?.data?.detail || "Failed to update payment status");
    }
};

// Update payment status via TREASURER (alternative)
export const updatePaymentStatusFromTreasurer = async (crId: string, paymentStatus: string) => {
    try {
        const response = await api.patch(`/treasurer/clearance-request/${crId}/payment-status/`, {
            payment_status: paymentStatus
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to update payment status from treasurer:", error);
        throw new Error(error.response?.data?.detail || "Failed to update payment status from treasurer");
    }
};

// Get payment statistics from TREASURER
export const getPaymentStatistics = async () => {
    try {
        const response = await api.get('/treasurer/clearance-request/payment-statistics/');
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch payment statistics:", error);
        throw new Error(error.response?.data?.detail || "Failed to fetch payment statistics");
    }
};

// Create payment intent via CLERK
export const createPaymentIntent = async (crId: string) => {
    try {
        const response = await api.post(`/clerk/payment/create/${crId}/`);
        return response.data;
    } catch (error: any) {
        console.error("Failed to create payment intent:", error);
        throw new Error(error.response?.data?.detail || "Failed to create payment intent");
    }
};


export const getNonResidentCertReq = async () => {
    try{
        const res = await api.get('/clerk/nonresident-personal-clearance/')

        return res.data
    }catch(err){
        console.error(err)
    }
}
