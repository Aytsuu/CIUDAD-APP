import { api } from "@/api/api";

export const getServiceChargeRequest = async () => {
    try{
        const res = await api.get('clerk/service-charge-request/')
        return res.data
    }catch(err){
        console.error(err)
    }
}


export const getCaseDetails = async (srId: string) => {
    try{
        const res = await api.get(`clerk/case-details/${srId}/`)
        return res.data
    } catch(err){
        console.error(err)
    }
}