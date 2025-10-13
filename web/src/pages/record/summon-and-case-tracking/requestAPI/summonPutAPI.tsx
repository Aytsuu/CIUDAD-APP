import { api } from "@/api/api";

export const resolveCase = async (sc_id: string) => {
    try{
        const res = await api.put(`clerk/update-summon-case/${sc_id}/`, {
            sc_mediation_status: "Resolved",
            sc_date_marked: new Date().toISOString(),
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const forwardCase = async(sc_id:string) => {
    try{
        const res = await api.put(`clerk/update-summon-case/${sc_id}/`, {
            sc_mediation_status: "Forwarded to Lupon",
            sc_conciliation_status: "Waiting for Schedule",
        })
        return res.data
    }catch(err){
        console.error(err)
        throw err
    }
}


export const escalateCase = async (sr_id: string) => {
    try{
        //  const res2 = await api.post('clerk/file-action-request/', {
        //     comp: comp_id,
        //     sr_type: 'File Action',
        //     sr_request_date: new Date().toISOString(),
        //     sr_payment_status: "Unpaid",
        //     parent_summon: sr_id
        // })

        console.log('sr_id', sr_id)
        const res = await api.put(`clerk/update-summon-request/${sr_id}/`, {
            sc_mediation_status: "Escalated",
            sr_date_marked: new Date().toISOString(),
        })

        return res.data
    }catch(err){
        console.error(err)
    }
}

