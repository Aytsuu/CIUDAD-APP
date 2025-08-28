import { api } from "@/api/api";

export const addReceipt = async (data: Record<string, any>) => {
    try{
        console.log("=== RECEIPT CREATION START ===");
        console.log("Full data received:", data);
        console.log("inv_nat_of_collection:", data.inv_nat_of_collection);
        console.log("bpr_id:", data.bpr_id);
        console.log("nrc_id:", data.nrc_id);
        console.log("=================================");
        
        // Check if this is a business clearance request
        console.log("Checking if business clearance request...");
        console.log("Condition 1 (inv_nat_of_collection === 'Permit Clearance'):", data.inv_nat_of_collection === "Permit Clearance");
        console.log("Condition 2 (data.bpr_id exists):", !!data.bpr_id);
        console.log("Combined condition:", data.inv_nat_of_collection === "Permit Clearance" || data.bpr_id);
        
        if (data.inv_nat_of_collection === "Permit Clearance" || data.bpr_id) {
            console.log("=== BUSINESS CLEARANCE STATUS UPDATE ===");
            console.log("Data received:", data);
            console.log("inv_nat_of_collection:", data.inv_nat_of_collection);
            console.log("bpr_id:", data.bpr_id);
            console.log("bpr_id type:", typeof data.bpr_id);
            console.log("========================================");
            
            // Update business permit request status using the existing business-clearance endpoint
            try {
                if (data.bpr_id) {
                    console.log(`Attempting to update business permit status for bpr_id: ${data.bpr_id}`);
                    console.log(`Calling endpoint: /clerk/business-clearance/ with PUT method`);
                    
                    const updateStatus = await api.put(`/clerk/business-clearance/`, {
                        bpr_id: data.bpr_id,
                        req_payment_status: "Paid",
                        req_date_completed: new Date().toISOString()
                    });
                    console.log('Business permit status updated successfully:', updateStatus.data);
                } else {
                    console.warn('Business clearance request but no bpr_id provided');
                }
            } catch (updateError: any) {
                console.error('Failed to update business permit status:', updateError);
                console.error('Error details:', updateError.response?.data);
                console.error('Error status:', updateError.response?.status);
                // Continue with receipt creation even if status update fails
            }
        } else if (data.nrc_id && data.nrc_id.trim() !== "") {
            // Update personal request status (existing logic)
            const updateStatus = await api.put(`/clerk/update-personal-req-status/${data.nrc_id}/`, {
                nrc_req_status: "In Progress",
                nrc_req_payment_status: "Paid",
                nrc_pay_date: new Date().toISOString()
            });
            console.log('Personal request status updated:', updateStatus.data);
        } else {
            console.warn('No valid ID provided for status update - skipping status update');
        }

        const payload = {
            inv_date: new Date().toISOString(),
            inv_amount: parseFloat(data.inv_amount),
            inv_nat_of_collection: data.inv_nat_of_collection,
            inv_serial_num: data.inv_serial_num,
            nrc_id: data.nrc_id || null, // Make optional for business clearance
            bpr_id: data.bpr_id || null, // Add business permit request ID
        };
        
        console.log('API Payload:', payload);
        console.log('Making API call to: treasurer/invoice/');
        
        const res = await api.post('treasurer/invoice/', payload);
        console.log('API Response:', res.data);
        return res.data;
    }catch(err: any){
        console.error('API Error:', err);
        console.error('Error Response:', err.response?.data);
        console.error('Error Status:', err.response?.status);
        throw err; // Re-throw the error so the mutation can handle it
    }
}