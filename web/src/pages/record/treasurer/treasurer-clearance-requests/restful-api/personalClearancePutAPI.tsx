import { api } from "@/api/api";

export const declinePersonalReq = async (cr_id: string) => {
    try{
        const res = await api.put(`/clerk/certificate-update-status/${cr_id}`, {
            cr_req_status: "In Progress"
        })
    }catch(err){
        console.error(err)
    }
}