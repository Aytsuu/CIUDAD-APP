import { api } from "@/api/api";

export const getServiceChargeRequest = async () => {
    try{
        const res = await api.get('clerk/service-charge-request/')
        return res.data
    }catch(err){
        console.error(err)
    }
}