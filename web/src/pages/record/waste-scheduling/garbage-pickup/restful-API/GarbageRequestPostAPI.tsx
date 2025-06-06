import { api } from "@/api/api";


export const addDecision = async (garb_id: string, decisionInfo: {reason: string}) => {
    try{

        const getLocalISOString = () => {
            const now = new Date();
            const tzOffset = now.getTimezoneOffset() * 60000; // offset in ms
            const localISO = new Date(now.getTime() - tzOffset).toISOString().slice(0, -1); // remove 'Z'
            return localISO;
        };

        console.log({
            dec_rejection_reason: decisionInfo.reason,
            dec_date: new Date().toISOString(),
            garb_id: garb_id
        })

        await api.put(`/waste/update-garbage-pickup-request/${garb_id}/`, {
            garb_req_status: "rejected"
        });

       const res = await api.post('/waste/pickup-request-decision/', {
            dec_rejection_reason: decisionInfo.reason,
            dec_date: getLocalISOString(), 
            garb_id: garb_id,
        });

        return res.data.dec_id

    } catch (err){
        console.error(err)
    }
}