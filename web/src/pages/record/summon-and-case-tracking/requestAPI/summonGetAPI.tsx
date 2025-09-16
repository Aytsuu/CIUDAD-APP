import { api } from "@/api/api";

export const getServiceChargeRequest = async () => {
    try{
        const res = await api.get('clerk/service-charge-request/')
        console.log(res.data)
        return res.data
    }catch(err){
        console.error(err)
    }
}


export const getCaseDetails = async (srId: string) => {
    try{
        const res = await api.get(`clerk/case-details/${srId}/`)

        console.log('complainants', res.data.complainant)

        return res.data
    } catch(err){
        console.error(err)
    }
}


export const getSuppDoc = async(ca_id: string) => {
    try{
        const res = await api.get(`clerk/case-supp-doc/${ca_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}


export const getSummonTemplate = async () => {
    try {
        const res = await api.get('council/summon-template/', {
            params: {
                 filename: "Complaint/Filing Fee/Summons",
            },
        });

        console.log(res.data)
        return res.data;
    } catch (err) {
        console.error(err);
    }
};


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


export const getSummonReqPendingList = async () => {
    try{
        const res = await api.get('clerk/service-charge-pending-list/')
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getSummonReqRejectedList = async () => {
    try{
        const res = await api.get('clerk/service-charge-rejected-list/')
        return res.data
    }catch(err){
        console.error(err)
    }
}


export const getSummonReqAcceptedList = async () => {
    try{
        const res = await api.get('clerk/service-charge-accepted-list/')
        return res.data
    }catch(err){
        console.error(err)
    }
}


export const getComplaintDetails = async (comp_id: string) => {
    try{
        const res = await api.get(`/complaint/${comp_id}/`)

        return res.data
    }catch(err){
        console.error(err)
    }
}

