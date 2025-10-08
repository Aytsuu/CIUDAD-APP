import { api } from "@/api/api";

export const getSummonCaseList = async () => {
    try{
        const res = await api.get('clerk/summon-case-list/')
        console.log(res.data)
        return res.data
    }catch(err){
        console.error(err)
    }
}


export const getSummonCaseDetail = async (sc_id: string) => {
    try{
        const res = await api.get(`clerk/summon-case-detail/${sc_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}



export const getSummonScheduleList = async (sr_id: string) => {
    try{
        const res = await api.get( `clerk/summon-schedule-list/${sr_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getSummonSuppDoc = async (ss_id: string) => {
    try{
        const res = await api.get( `clerk/summon-supp-doc/${ss_id}/`)
        return res.data
    }catch(err){
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


export const getComplaintDetails = async (comp_id: string) => {
    try{
        const res = await api.get(`/complaint/view/${comp_id}/`)

        return res.data
    }catch(err){
        console.error(err)
    }
}
