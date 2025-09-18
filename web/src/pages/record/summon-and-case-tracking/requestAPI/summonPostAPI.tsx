import { api } from "@/api/api";

export const addSchedule = async (schedule: Record<string, any>) => {
    try{
        console.log('data:', {
            sd_id: schedule.sd_id,
            st_id: schedule.st_id,
            ss_mediation_level: schedule.ss_mediation_level,
            ss_reason: "Ongoing Mediation",
            ss_is_rescheduled: false,
            sr_id: schedule.sr_id
        })
   
        const res = await api.post('clerk/create-summon-sched/', {
            sd_id: schedule.sd_id,
            st_id: schedule.st_id,
            ss_mediation_level: schedule.ss_mediation_level,
            ss_reason: "Ongoing Mediation",
            ss_is_rescheduled: false,
            sr_id: schedule.sr_id
        })

        if(res){
            await api.put(`clerk/update-summon-request/${schedule.sr_id}/`, {
                sr_case_status: "Ongoing",
            })

            await api.put(`clerk/update-summon-time-availability/${schedule.st_id}/`, {
                st_is_booked: true,
            })

        }

        return res.data
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

export const addSuppDoc = async ( ss_id: string, sr_id: string, files: { name: string; type: string; file: string | undefined }[], reason: string
) => {
    try {
        const data = {
            ss_id,
            files: files.map(file => ({
                name: file.name,
                type: file.type,
                file: file.file  
            }))
        };

        console.log(data)

        const response = await api.post('clerk/summon-supp-doc/', data);

        if(response){
            await api.put(`clerk/update-summon-sched/${ss_id}/`, {
                ss_is_rescheduled: true,
                ss_reason: reason
            })

            await api.put(`clerk/update-summon-request/${sr_id}/`, {
                sr_case_status: "Waiting for Schedule"
            })
            
        }

        return response.data;
    } catch (error: any) {
        console.error('Upload failed:', error.response?.data || error);
        throw error;
    }
};


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