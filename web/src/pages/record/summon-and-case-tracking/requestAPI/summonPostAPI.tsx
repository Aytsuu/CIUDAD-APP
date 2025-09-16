import { api } from "@/api/api";
import type { MediaUploadType } from "@/components/ui/media-upload";

export const addCaseActivity = async (caseInfo: Record<string, any>) => {
    try{
        console.log('data',{
            ca_hearing_date : caseInfo.hearingDate,
            ca_hearing_time : caseInfo.hearingTime,
            ca_reason: caseInfo.reason,
            ca_mediation: caseInfo.mediation,
            ca_date_of_issuance: new Date().toISOString(),
            sr: caseInfo.sr_id,
        })

        const res = await api.post('clerk/case-activity/', {
            ca_hearing_date : caseInfo.hearingDate,
            ca_hearing_time : caseInfo.hearingTime,
            ca_reason: caseInfo.reason,
            ca_mediation: caseInfo.mediation,
            ca_date_of_issuance: new Date().toISOString(),
            sr: Number(caseInfo.sr_id),
        })
        return res.data.ca_id
    }catch(err){
        console.error(err)
        throw err;
    }
}

// export const addSuppDoc = async(ca_id: string, media: MediaUploadType[number], description: string) => {    
    // try{

    //     if (media.status !== 'uploaded' || !media.publicUrl || !media.storagePath) {
    //         throw new Error('File upload incomplete: missing URL or path');
    //     }

 

    //     const formData = new FormData();
    //     formData.append('file', media.file);
    //     formData.append('ca_id', ca_id);
    //     formData.append('csd_name', media.file.name);
    //     formData.append('csd_type', media.file.type || 'application/octet-stream');
    //     formData.append('csd_path', media.storagePath);
    //     formData.append('csd_url', media.publicUrl);
    //     formData.append('csd_upload_date', new Date().toISOString());
    //     formData.append('csd_description', description);

    //     console.log(formData)

    //     const res = await api.post('clerk/case-supp-doc/', formData)

    //     return res.data
    // }catch(err){
    //     console.error(err)
    // }
// }

export const addSummonDate = async (newDates: string[], oldDates: {
    sd_id: number;
    sd_is_checked: boolean;
}[]) => {
    try {

        oldDates.forEach(oldDate => {
            if (!oldDate.sd_is_checked) {
                api.delete(`clerk/delete-summon-date/${oldDate.sd_id}/`);
            }
        });

        const responses = await Promise.all(
            newDates.map(date => 
                api.post('clerk/summon-date-availability/', {
                    sd_date: date 
                })
            )
        );
        
        return responses.map(res => res.data);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const addSummonTimeSlots = async (timeSlots: Array<{
    sd_id: number;
    st_start_time: string;
    st_end_time: string;
    st_is_booked?: boolean;
}>) => {

    console.log('Slots', timeSlots)
    try {
        const res = await api.post('clerk/summon-time-availability/', timeSlots);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err; 
    }
}