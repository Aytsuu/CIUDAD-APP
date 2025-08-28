import { api } from "@/api/api";

export const acceptReq = async (cr_id: string) => {
    try{
        const res = await api.put(`/clerk/certificate-update-status/${cr_id}/`, {
            cr_req_status: "In Progress",
            cr_req_payment_status: "Paid"
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const declineReq = async (cr_id: string, reason: string) => {
    try{
        const res = await api.put(`/clerk/certificate-update-status/${cr_id}/`, {
            cr_req_status: "Declined",
            cr_reason: reason,
            cr_date_rejected: new Date().toISOString()
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const declineNonResReq = async (nrc_id: string, reason: string) => {
    try{
        const res = await api.put(`/clerk/update-personal-req-status/${nrc_id}/`, {
            nrc_req_status: "Declined",
            nrc_reason: reason,
            nrc_date_rejected: new Date().toISOString()
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}