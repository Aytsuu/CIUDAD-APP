import { api } from "@/api/api";

export const resolveCase = async (sr_id: string) => {
    try{
        const res = await api.put(`clerk/update-service-charge-request/${sr_id}/`, {
            status: "Resolved",
            decision_date: new Date().toISOString(),
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const escalateCase = async (sr_id: string, comp_id: string) => {
    try{
         const res2 = await api.post('clerk/file-action-request/', {
            comp: comp_id,
            sr_type: 'File Action',
            sr_request_date: new Date().toISOString(),
            sr_payment_status: "Unpaid",
            parent_summon: sr_id
        })

        const res = await api.put(`clerk/update-service-charge-request/${sr_id}/`, {
            status: "Escalated",
            decision_date: new Date().toISOString(),
        })

        return res.data
    }catch(err){
        console.error(err)
    }
}