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

