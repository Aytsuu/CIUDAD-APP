import api from "@/api/api";

export const addSummonSched = async (sd_id: string, st_id: string, sc_id: string, level: string, type: string) => {
    try{
        const res = await api.post('clerk/hearing-schedule/', {
            sd_id: sd_id,
            st_id: st_id,
            hs_level: level,
            hs_is_closed: false,
            sc_id: sc_id
        })

        if(res){
            if(type == "Council"){
                await api.put(`clerk/update-summon-case/${sc_id}/`, {
                    sc_mediation_status: "Ongoing",
                })
            } else {
                await api.put(`clerk/update-summon-case/${sc_id}/`, {
                    sc_conciliation_status: "Ongoing",
                })
            }

            await api.put(`clerk/update-summon-time-availability/${st_id}/`, {
                st_is_booked: true,
            })

        }
        return res.data
    }catch(err){
        // console.error(err)
        throw err;
    }
}

