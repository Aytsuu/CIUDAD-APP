import { api } from "@/api/api";

export const resolveCase = async (sr_id: string) => {
    try{
        const res = await api.put(`clerk/update-service-charge-request/${sr_id}/`, {
            status: "Resolved"
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const escalateCase = async (sr_id: string) => {
    try{
        const res = await api.put(`clerk/update-service-charge-request/${sr_id}/`, {
            status: "Escalated"
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}