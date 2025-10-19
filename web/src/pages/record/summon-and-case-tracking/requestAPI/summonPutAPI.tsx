import { api } from "@/api/api";

export const resolveCase = async (status_type: string, sc_id: string) => {
    try{

        if(status_type == "Council"){
            const res = await api.put(`clerk/update-summon-case/${sc_id}/`, {
                sc_mediation_status: "Resolved",
                sc_date_marked: new Date().toISOString(),
            })

            return res.data
        } else {
            const res = await api.put(`clerk/update-summon-case/${sc_id}/`, {
                sc_conciliation_status: "Resolved",
                sc_date_marked: new Date().toISOString(),
            })
            return res.data
        }
        
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


export const escalateCase = async (sc_id: string, comp_id: string) => {
    try{
        const currentDate = new Date();
        const dueDate = new Date(currentDate);
        dueDate.setDate(currentDate.getDate() + 7);

        const response = await api.get('clerk/file-action-id/')

        if(response){
            await api.post('clerk/service-charge-payment-req/', {
                comp_id: comp_id,
                pay_sr_type: "File Action",
                pay_status: "Unpaid",
                pay_req_status: "Pending",
                pay_date_req: new Date().toISOString(),
                pay_due_date: dueDate.toISOString().split('T')[0],
                pr_id: response.data.pr_id
            })
        }

        const res = await api.put(`clerk/update-summon-case/${sc_id}/`, {
            sc_conciliation_status: "Escalated",
            sc_date_marked: new Date().toISOString(),
        })

        return res.data
    }catch(err){
        console.error(err)
    }
}

