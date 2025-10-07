import { api } from "@/api/api";

// Create permit clearance
export const createPermitClearance = async (payload: any, staffId: string) => {
    try {
        // Handle business ID - now stored in businessName field
        let businessId = payload.businessName; // businessName now contains the business ID
        if (businessId && !businessId.startsWith('BUS-')) {
            console.warn("Business ID appears to be a name instead of ID:", businessId);
            businessId = null;
        }
        
        const clearancePayload = {
            requestor: payload.requestor,
            req_request_date: new Date().toISOString().split('T')[0], // Current date
            req_status: 'Pending',
            req_payment_status: 'Unpaid',
            ags_id: payload.grossSales ? parseInt(payload.grossSales) : null, // Convert to integer
            pr_id: payload.purposes ? parseInt(payload.purposes) : null, // purposes now contains the purpose ID
            staff_id: staffId, // Staff ID (who is processing the request)
            bus_id: businessId, // Business ID from form
            rp_id: payload.rp_id || null, // Resident profile ID from form
            req_amount: 0.0 // Set default amount, will be calculated by backend
        };

        console.log("Creating permit clearance with payload:", clearancePayload);
        console.log("Original payload received:", payload);
        console.log("Business ID from payload.businessName:", payload.businessName);
        console.log("Purpose ID from payload.purposes:", payload.purposes);
        console.log("Gross Sales from payload:", payload.grossSales);
        console.log("Payload keys:", Object.keys(payload));
        console.log("Payload values:", Object.values(payload));
        const response = await api.post('/clerk/permit-clearances/', clearancePayload);
        return response.data;
    } catch (error: any) {
        console.error("Failed to create permit clearance:", error);
        throw new Error(error.response?.data?.detail || "Failed to create permit clearance");
    }
};
