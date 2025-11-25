import { api } from "@/api/api";

// Create permit clearance
export const createPermitClearance = async (payload: any, staffId: string) => {
    try {
        // Handle business ID - now stored in businessName field
        let businessId = payload.businessName; // businessName now contains the business ID or business name
        if (businessId && !businessId.startsWith('BUS-')) {
            // If it doesn't start with BUS-, it's a custom business name (for Business Clearance)
            businessId = null;
        }
        
        const clearancePayload: any = {
            req_request_date: new Date().toISOString().split('T')[0], // Current date
            req_status: 'Pending',
            req_payment_status: 'Unpaid',
            ags_id: payload.grossSales ? parseInt(payload.grossSales) : null, // Convert to integer
            pr_id: payload.purposes ? parseInt(payload.purposes) : null, // purposes now contains the purpose ID
            staff_id: staffId, // Staff ID (who is processing the request)
            bus_id: businessId, // Business ID from form (null if custom business name)
            rp_id: payload.rp_id || null, // Resident profile ID from form
            req_amount: 0.0, // Set default amount, will be calculated by backend
        };

        // Include bus_permit_name and bus_permit_address for new businesses (no bus_id) or Business Clearance
        if (!businessId) {
            // For Business Clearance or new businesses, use businessName as the business name
            clearancePayload.bus_permit_name = payload.businessName || payload.requestor || null;
            clearancePayload.bus_permit_address = payload.address || null;
        }

        // Include bus_clearance_gross_sales for Business Clearance (manual gross sales input)
        if (payload.manualGrossSales) {
            const manualGrossSales = parseFloat(payload.manualGrossSales);
            if (!isNaN(manualGrossSales)) {
                clearancePayload.bus_clearance_gross_sales = manualGrossSales;
            }
        }

        // Include bus_nonresident_name when rp_id is null (non-resident requestor)
        // Convert to uppercase before saving
        if (!payload.rp_id && payload.requestor) {
            clearancePayload.bus_nonresident_name = payload.requestor.toUpperCase().trim();
        }

        const response = await api.post('/clerk/permit-clearances/', clearancePayload);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || "Failed to create permit clearance");
    }
};

// Decline permit clearance
    export const declinePermitClearance = async (bpr_id: string, reason: string, staffId: string) => {
        try {
            const payload = {
                req_status: "Declined",
                req_payment_status: "Declined",
                bus_reason: reason,
                staff_id: staffId
            };
            
            const response = await api.post(`/clerk/business-permit/${bpr_id}/cancel/`, payload);
            
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Failed to decline permit clearance");
        }
    };