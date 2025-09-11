import { api } from "@/api/api";

const getLocalISOString = () => {
        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000; 
        const localISO = new Date(now.getTime() - tzOffset).toISOString().slice(0, -1);
        return localISO;
    };

export const updateGarbageRequestStatus = async (garb_id: string) => {
    try{

        await api.put(`/waste/update-garbage-pickup-request/${garb_id}/`, {
                garb_req_status: "completed"
        });

        const res = await api.post('/waste/pickup-confirmation/', {
            garb_id: garb_id,
            conf_resident_conf: false,
            conf_staff_conf: true,
            conf_staff_conf_date: getLocalISOString()
        })

        return res.data.conf_id
    } catch(err){
        console.error(err)
    }
}
