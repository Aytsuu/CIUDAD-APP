import { api } from "@/api/api";

export const addReceipt = async (data: Record<string, any>) => {
    try{

        const updateStatus = await api.put(`/clerk/update-personal-req-status/${data.id}/`, {
            nrc_req_status: "In Progress",
            nrc_req_payment_status: "Paid",
            nrc_pay_date: new Date().toISOString()
        })

        const payload = {
            inv_date: new Date().toISOString(),
            inv_amount: parseFloat(data.inv_amount),
            inv_nat_of_collection: data.inv_nat_of_collection,
            inv_serial_num: data.inv_serial_num,
            nrc_id: data.nrc_id,
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