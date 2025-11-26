import { api } from "@/api/api";

export const getActiveMinutesOfMeeting = async (page: number, pageSize: number, searchQuery: string) => {
    try{
        const res = await api.get('council/minutes-of-meeting-active/', {
            params: {
                page,
                page_size: pageSize,
                search: searchQuery
            }
        })
        return res.data
    } catch (err){
        // console.error(err)
        throw err
    }
}

export const getInactiveMinutesOfMeeting = async (page: number, pageSize: number, searchQuery: string) => {
    try{
        const res = await api.get('council/minutes-of-meeting-inactive/', {
            params: {
                page,
                page_size: pageSize,
                search: searchQuery
            }
        })
        return res.data
    } catch (err){
        // console.error(err)
        throw err
    }
}