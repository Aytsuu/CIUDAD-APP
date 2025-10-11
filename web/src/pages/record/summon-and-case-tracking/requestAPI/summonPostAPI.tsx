import { api } from "@/api/api";


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


export const addSchedule = async (schedule: Record<string, any>) => {
    try{
        console.log('data:', {
            sd_id: schedule.sd_id,
            st_id: schedule.st_id,
            hs_level: schedule.hs_level,
            hs_is_closed: false,
            sc_id: schedule.sc_id
        })
   
        const res = await api.post('clerk/hearing-schedule/', {
            sd_id: schedule.sd_id,
            st_id: schedule.st_id,
            hs_level: schedule.hs_level,
            hs_is_closed: false,
            sc_id: schedule.sc_id
        })

        if(res){
            await api.put(`clerk/update-summon-case/${schedule.sc_id}/`, {
                sc_mediation_status: "Ongoing",
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


export const addHearingMinutes = async ( hs_id: string, sc_id: string, files: { name: string; type: string; file: string | undefined }[]) => {
    try{
        const data = {
            hs_id,
            files: files.map(file => ({
                name: file.name,
                type: file.type,
                file: file.file  
            }))
        };

        const response = await api.post('clerk/hearing-minutes/', data);

        if(response){
            await api.put(`clerk/update-hearing-schedule/${hs_id}/`, {
                hs_is_closed: true,
            })

            await api.put(`clerk/update-summon-case/${sc_id}/`, {
                sc_mediation_status: "Waiting for Schedule",
            })

        }

        return response.data;

    }catch(err){
        console.error(err)
        throw err;
    }
}


export const addRemarks = async (hs_id: string, st_id: string | number, sc_id: string, remarks: string, close: boolean, files: { name: string; type: string; file: string | undefined }[]) => {
    try{

        // insert the remark
        const response = await api.post('clerk/remark/', {
            rem_date: new Date().toISOString(),
            rem_remarks: remarks,
            hs_id: hs_id
        })

        // extract the rem_id
        const rem_id = response.data.rem_id

        // prepare payload for suppdocs
        const data = {
            rem_id,
            files: files.map(file => ({
                name: file.name,
                type: file.type,
                file: file.file  
            }))
        };

        //add supp doc
        if(rem_id){
            await api.post('clerk/remark-supp-docs/', data)
        }

        // if close checkbox is checked, close the hearing schedule and re-open the timeslot
        if(close){
            await api.put(`clerk/update-hearing-schedule/${hs_id}/`, {
                hs_is_closed: true,
            })
            await api.put(`clerk/update-summon-time-availability/${st_id}/`, {
                st_is_booked: false,
            })

            await api.put(`clerk/update-summon-case/${sc_id}/`, {
                sc_mediation_status: "Waiting for Schedule",
            })
        }

        return response.data
    }catch(err){
        console.error(err)
        throw err
    }
}




