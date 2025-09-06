import { api } from "@/api/api";

export const updateGarbageRequestStatus = async (garb_id: string) => {
    try{

        await api.put(`/waste/update-garbage-pickup-request/${garb_id}/`, {
                garb_req_status: "completed"
        });

        const res = await api.post('/waste/pickup-confirmation/', {
            garb_id: garb_id,
            conf_resident_conf: false,
            conf_staff_conf: true,
            conf_staff_conf_date: new Date().toISOString(), 
        })

        return res.data.conf_id
    } catch(err){
        console.error(err)
    }
}
