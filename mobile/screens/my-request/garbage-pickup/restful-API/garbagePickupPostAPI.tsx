import { api } from "@/api/api";


export const cancelGarbageRequest = async (values: {garb_id: string, reason: string}) => {
    try{
        await api.put(`/waste/update-garbage-pickup-request/${values.garb_id}/`, {
            garb_req_status: "cancelled"
        });

        const res = await api.post('/waste/pickup-request-decision/', {
            dec_reason: values.reason,
            dec_date: new Date().toISOString(), 
            garb_id: values.garb_id,
        });
    }catch(err){
        console.error('API Error:', err)
        throw err;
    }
}