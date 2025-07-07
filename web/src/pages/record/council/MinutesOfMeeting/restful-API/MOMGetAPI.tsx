import { api } from "@/api/api";

export const getMinutesOfMeeting = async () => {
    try{
        const res = await api.get('council/minutes-of-meeting/')
        return res.data
    } catch (err){
        console.error(err)
    }
}