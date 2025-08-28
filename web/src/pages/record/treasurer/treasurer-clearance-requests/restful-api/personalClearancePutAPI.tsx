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