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