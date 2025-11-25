import { api } from "@/api/api";

export const updateGarbageReqStatusResident = async (garb_id: string) => {
    try{
        const res = await api.put(`/waste/update-pickup-confirmation/${garb_id}/`, {
            garb_id: garb_id,
            conf_resident_conf: true,
            conf_resident_conf_date: new Date().toISOString(), 
        })

        return res.data.conf_id
    } catch(err){
        // console.error(err)
        throw err
    }
}