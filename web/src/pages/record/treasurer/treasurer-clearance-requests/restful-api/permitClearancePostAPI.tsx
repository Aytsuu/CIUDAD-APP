import { api } from "@/api/api";

// Create permit clearance
export const createPermitClearance = async (payload: any, staffId: string) => {
    try {
        // Handle business ID - now stored in businessName field
        let businessId = payload.businessName; // businessName now contains the business ID
        if (businessId && !businessId.startsWith('BUS-')) {
            businessId = null;
        }
        
        const clearancePayload: any = {
            req_request_date: new Date().toISOString().split('T')[0], // Current date
            req_status: 'Pending',
            req_payment_status: 'Unpaid',
            ags_id: payload.grossSales ? parseInt(payload.grossSales) : null, // Convert to integer
            pr_id: payload.purposes ? parseInt(payload.purposes) : null, // purposes now contains the purpose ID
            staff_id: staffId, // Staff ID (who is processing the request)
            bus_id: businessId, // Business ID from form
            rp_id: payload.rp_id || null, // Resident profile ID from form
            req_amount: 0.0, // Set default amount, will be calculated by backend
        };

        // Only include bus_permit_name and bus_permit_address for new businesses (no bus_id)
        if (!businessId) {
            clearancePayload.bus_permit_name = payload.requestor || null;
            clearancePayload.bus_permit_address = payload.address || null;
        }


        const response = await api.post('/clerk/permit-clearances/', clearancePayload);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || "Failed to create permit clearance");
    }
};

// Decline permit clearance
export const declinePermitClearance = async (bpr_id: string, reason: string) => {
    try {
        const payload = {
            req_status: "Declined",
            req_payment_status: "Declined",
            bus_reason: reason
        };
        
        const response = await api.post(`/clerk/business-permit/${bpr_id}/cancel/`, payload);
        
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || "Failed to decline permit clearance");
    }
};