import { api } from "@/api/api";

export const addCaseActivity = async (caseInfo: Record<string, any>) => {
    try{
        console.log('data',{
            ca_hearing_date : caseInfo.hearingDate,
            ca_hearing_time : caseInfo.hearingTime,
            ca_reason: caseInfo.reason,
            ca_date_of_issuance: new Date().toISOString(),
            sr  : caseInfo.sr_id,
        })

        const res = await api.post('clerk/case-activity/', {
            ca_hearing_date : caseInfo.hearingDate,
            ca_hearing_time : caseInfo.hearingTime,
            ca_reason: caseInfo.reason,
            ca_date_of_issuance: new Date().toISOString(),
            sr: Number(caseInfo.sr_id),
        })
        return res.data.ca_id
    }catch(err){
        console.error(err)
    }
}