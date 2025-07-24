import { api } from "@/api/api";

export const getMinutesOfMeeting = async () => {
    try{
        const res = await api.get('council/minutes-of-meeting/')
        return res.data
    } catch (err){
        console.error(err)
    }
}

export const getMinutesOfMeetingDetails = async (mom_id: string) => {
    try{
        const res = await api.get(`council/mom-details-view/${mom_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}