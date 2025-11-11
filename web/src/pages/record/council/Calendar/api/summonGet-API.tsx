import api from "@/api/api";

export const getMediationSchedules = async () => {
    try{
        const res = await api.get('/clerk/mediation-calendar/')
        return res.data
    }catch(err){
        console.error(err)
        throw err
    }
}