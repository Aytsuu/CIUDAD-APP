import {api} from "@/api/api";


export const getInvoice = async () => {
    try {
        
        const [invoiceRes, nonResidentRes] = await Promise.all([
            api.get('treasurer/invoice/'),
            api.get('/clerk/nonresident-personal-clearance/')
        ]);
        
        const invoiceData = invoiceRes.data || [];
        const nonResidentData = nonResidentRes.data || [];
        
       
        const transformedNonResidentData = nonResidentData
            .filter((item: any) => item.nrc_req_payment_status === "Paid")
            .map((item: any) => ({
                inv_num: item.nrc_id,
                inv_serial_num: `NRC-${item.nrc_id}`,
                inv_date: item.nrc_pay_date || item.nrc_req_date,
                inv_amount: item.amount || "0",
                inv_nat_of_collection: item.purpose?.pr_purpose || "Certificate Request",
                inv_pay_method: "Cash", // Default payment method
                inv_payor: item.nrc_requester,
                inv_change: "0", // Default change
                nrc_discount_reason: item.nrc_discount_reason,
                // Keep original data for reference
                original_data: item
            }));
        
        // Combine both datasets
        return [...invoiceData, ...transformedNonResidentData];
        
    } catch (err) {
        console.error(err);
        return [];
    }
};