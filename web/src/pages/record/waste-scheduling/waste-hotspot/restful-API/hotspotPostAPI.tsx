import { api } from "@/api/api";

export const addHotspot = async (hotspotInfo: Record<string, any>) => {

    console.log({
            wh_date: hotspotInfo.date,
            wh_start_time: hotspotInfo.start_time,
            wh_end_time: hotspotInfo.end_time,
            wh_add_info: hotspotInfo.additionalInstructions,
            wh_is_archive: false,
            sitio_id: hotspotInfo.sitio,
            wstp_id: hotspotInfo.watchman,
            staff_id: hotspotInfo.staff_id
    })

    try{
        const res = await api.post('waste/waste-hotspot/', {
            wh_date: hotspotInfo.date,
            wh_start_time: hotspotInfo.start_time,
            wh_end_time: hotspotInfo.end_time,
            wh_add_info: hotspotInfo.additionalInstructions,
            wh_is_archive: false,
            sitio_id: hotspotInfo.sitio,
            wstp_id: hotspotInfo.watchman,
             staff_id: hotspotInfo.staff_id
        })

        return res.data.wh_num
    } catch(err){
        console.error(err)
    }
}