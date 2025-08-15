import { api } from "@/api/api";

export const deleteSuppDoc = async (csd_id: string) => {
    try{
        const res = await api.delete(`clerk/delete-case-supp-doc/${csd_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const deleteSummonTime = async (st_id: number) => {
    try{
        const res = await api.delete(`clerk/delete-summon-time-availability/${st_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}