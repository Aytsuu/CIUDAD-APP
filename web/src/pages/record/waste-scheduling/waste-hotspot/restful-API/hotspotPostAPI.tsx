import { api } from "@/api/api";

export const addHotspot = async (hotspotInfo: Record<string, any>) => {

    console.log({
            wh_date: hotspotInfo.date,
            wh_time: hotspotInfo.time,
            wh_add_info: hotspotInfo.additionalInstructions,
            wh_is_archive: false,
            sitio_id: hotspotInfo.sitio,
            wstp_id: hotspotInfo.watchman,
    })

    try{
        const res = await api.post('waste/waste-hotspot/', {
            wh_date: hotspotInfo.date,
            wh_time: hotspotInfo.time,
            wh_add_info: hotspotInfo.additionalInstructions,
            wh_is_archive: false,
            sitio_id: hotspotInfo.sitio,
            wstp_id: hotspotInfo.watchman,
        })

        return res.data.wh_num
    } catch(err){
        console.error(err)
    }
}