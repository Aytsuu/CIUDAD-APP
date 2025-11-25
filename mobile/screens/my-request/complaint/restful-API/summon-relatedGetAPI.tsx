import api from "@/api/api";

export const getSummonDates = async() => {
    try{
        const res = await api.get('clerk/summon-date-availability/')
        return res.data
    }catch(err){
        // console.error(err)
        throw err
    }
}

export const getSummonTimeSlots = async(sd_id: number) => {
    try{
        const res = await api.get(`clerk/summon-time-availability/${sd_id}/`)
        return res.data
    }catch(err){
        // console.error(err)
        throw err
    }
}

export const getCaseTrackingDetails = async(comp_id: string) => {
    try{

        const res = await api.get(`clerk/case-tracking/${comp_id}/`)
        return res.data

    }catch(err){
        // console.error(err)
        throw err
    }
}

export const getSummonScheduleList = async (sc_id: string) => {
    try{
        const res = await api.get( `clerk/summon-schedule-list/${sc_id}/`)
        return res.data
    }catch(err){
        // console.error(err)
        throw err
    }
}

export const getSummonPaymentLogs = async (comp_id: string) => {
    try{
        const res = await api.get(`clerk/summon-payment-logs/${comp_id}/`)
        return res.data
    }catch(err){
        // console.error(err)
        throw err
    }
}

export const getFileActionPaymentLogs = async (comp_id: string) => {
    try{
        const res = await api.get(`clerk/file-action-payment-logs/${comp_id}/`)
        return res.data
    }catch(err){
        // console.error(err)
        throw err
    }
}