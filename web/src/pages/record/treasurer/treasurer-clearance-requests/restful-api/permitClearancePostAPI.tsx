import { api } from "@/api/api";

// Annual gross sales options for permit clearances
// export const annualGrossSales = [
//     { id: "1", name: " P 50,000.00 and below P 100,000.00" },
//     { id: "2", name: "P 100,001.00 and below  P 200,000.00" },
//     { id: "3", name: "P 200,001.00 and below P 500,000.00" },
//     { id: "4", name: "P 500,001.00 and below P 1,000,000.00" },
//     { id: "5", name: "P 1,000,001.00 and below P 2,000,000.00" },
//     { id: "6", name: "P 2,000,001.00 and below P 5,000,000.00" },
//     { id: "7", name: "P 5,000,001.00 and below P 10,000,000.00" },
//     { id: "8", name: "P 10,000,001.00 and above" },
// ];

// Create permit clearance
export const createPermitClearance = async (payload: any) => {
    try {
        // Generate a unique bpr_id (max 10 characters)
        const timestamp = Date.now().toString();
        const randomPart = Math.random().toString(36).substring(2, 3).toUpperCase();
        const bpr_id = `BPR${timestamp.slice(-6)}${randomPart}`;
        
        // For now, use a hardcoded staff ID that should exist in the database
        const staffId = "00001250819"; // Hardcoded staff ID
        
        const clearancePayload = {
            bpr_id: bpr_id,
            business_name: payload.businessName,
            business_address: payload.address,
            business_gross_sales: payload.grossSales,
            requestor: payload.requestor,
            req_purpose: payload.purposes, // Single purpose string
            req_pay_method: "Walk-in", // Default payment method
            req_request_date: new Date().toISOString().split('T')[0], // Current date
            req_claim_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            req_transac_id: 'None',
            req_sales_proof: 'None', // Default value
            req_status: 'Pending',
            req_payment_status: 'Unpaid',
            ags_id: null, // Annual gross sales ID (optional)
            pr_id: null, // Purpose and rate ID (optional)
            staff_id: staffId, // Staff ID (who is processing the request)
            bus_id: null // Business ID 
        };

        console.log("Creating permit clearance with payload:", clearancePayload);
        const response = await api.post('/clerk/permit-clearances/', clearancePayload);
        return response.data;
    } catch (error: any) {
        console.error("Failed to create permit clearance:", error);
        throw new Error(error.response?.data?.detail || "Failed to create permit clearance");
    }
};
