import { api } from "@/api/api";

export const acceptReq = async (cr_id: string) => {
    try{
        const res = await api.put(`/clerk/certificate-update-status/${cr_id}/`, {
            cr_req_status: "In Progress",
            cr_req_payment_status: "Paid",
            cr_pay_date: new Date().toISOString()
        })
        return res.data
    }catch(err){
        // Error handled
    }
}

export const declineReq = async (cr_id: string, reason: string) => {

    try{
        const res = await api.put(`/clerk/certificate-update-status/${cr_id}/`, {
            cr_req_status: "Declined",
            cr_req_payment_status: "Declined",
            cr_reason: reason,
            cr_date_rejected: new Date().toISOString()
        })
        return res.data
    }catch(err){
        // Error handled
    }
}

export const acceptNonResReq = async (nrc_id: string, discountReason?: string) => {
    try{
        const payload: any = {
            nrc_req_status: "In Progress",
            nrc_req_payment_status: "Paid",
            nrc_pay_date: new Date().toISOString()
        };
        
        if (discountReason) {
            payload.nrc_discount_reason = discountReason;
        }
        
        const url = `/clerk/update-personal-req-status/${nrc_id}/`;
        const res = await api.put(url, payload)
        return res.data
    }catch(err){
        throw err;
    }
}

export const declineNonResReq = async (nrc_id: string, reason: string) => {
    try{
        const url = `/clerk/update-personal-req-status/${nrc_id}/`;
        const payload = {
            nrc_req_status: "Declined",
            nrc_req_payment_status: "Declined",
            nrc_reason: reason,
            nrc_date_rejected: new Date().toISOString()
        };
        const res = await api.put(url, payload)
        return res.data
    }catch(err){
        throw err;
    }
}