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

export const getConciliationSchedules = async () => {
    try{
        const res = await api.get('/clerk/conciliation-calendar/')
        return res.data
    }catch(err){
        console.error(err)
        throw err
    }
}