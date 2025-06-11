import { api } from "@/api/api";

export const editHotspot = async (wh_num: string, hotspotUpdate: Record<string,any>) => {
    try{
        const res = await api.put(`waste/update-waste-hotspot/${wh_num}/`, {
            wh_date: hotspotUpdate.date,
            wh_time: hotspotUpdate.time,
            wh_add_info: hotspotUpdate.additionalInstructions,
            sitio_id: hotspotUpdate.sitio,
            wstp_id: hotspotUpdate.watchman,
        })
        return res.data
    } catch (err){
        console.error(err)
    }
}