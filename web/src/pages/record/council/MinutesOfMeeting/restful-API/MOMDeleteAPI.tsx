import { api } from "@/api/api";

export const deleteMinutesOfMeeting = async (mom_id: string) => {
    try{
        const res = await api.delete(`council/delete-minutes-of-meeting/${mom_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}