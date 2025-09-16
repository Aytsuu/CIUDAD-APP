import { api } from "@/api/api"

export const getSummonDates = async() => {
    try{
        const res = await api.get('clerk/summon-date-availability/')
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getSummonTimeSlots = async(sd_id: number) => {
    try{
        const res = await api.get(`clerk/summon-time-availability/${sd_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}