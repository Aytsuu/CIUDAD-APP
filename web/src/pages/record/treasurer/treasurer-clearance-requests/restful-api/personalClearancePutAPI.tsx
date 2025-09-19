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
        console.error(err)
    }
}

export const declineReq = async (cr_id: string, reason: string) => {

    try{
        console.log("DECLINE RES ID: ", cr_id)
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
        
        const numericId = Number(nrc_id);
        const url = `/clerk/update-personal-req-status/${numericId}/`;
        console.log("[acceptNonResReq] Calling:", {
            nrc_id,
            typeof_nrc_id: typeof nrc_id,
            numericId,
            url,
            payload
        });
        const res = await api.put(url, payload)
        return res.data
    }catch(err){
        // Enhanced debug
        const anyErr: any = err as any;
        console.error("[acceptNonResReq] Error:", anyErr);
        console.error("[acceptNonResReq] Response status:", anyErr?.response?.status);
        console.error("[acceptNonResReq] Response data:", anyErr?.response?.data);
        throw err;
    }
}

export const declineNonResReq = async (nrc_id: string, reason: string) => {
    try{
        console.log("DECLINE RES ID: ", nrc_id)
        const numericId = Number(nrc_id);
        const url = `/clerk/update-personal-req-status/${numericId}/`;
        const payload = {
            nrc_req_status: "Declined",
            nrc_reason: reason,
            nrc_date_rejected: new Date().toISOString()
        };
        console.log("[declineNonResReq] Calling:", {
            nrc_id,
            typeof_nrc_id: typeof nrc_id,
            numericId,
            url,
            payload
        });
        const res = await api.put(url, payload)
        return res.data
    }catch(err){
        const anyErr: any = err as any;
        console.error("[declineNonResReq] Error:", anyErr);
        console.error("[declineNonResReq] Response status:", anyErr?.response?.status);
        console.error("[declineNonResReq] Response data:", anyErr?.response?.data);
        throw err;
    }
}