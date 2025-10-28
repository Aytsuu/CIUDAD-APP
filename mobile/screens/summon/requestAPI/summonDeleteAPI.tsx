import { api } from "@/api/api";

export const deleteSummonTime = async (st_id: number) => {
    try{
        const res = await api.delete(`clerk/delete-summon-time-availability/${st_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}
