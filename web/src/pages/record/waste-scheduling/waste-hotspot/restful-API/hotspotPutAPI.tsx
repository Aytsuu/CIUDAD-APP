import { api } from "@/api/api";

export const editHotspot = async (wh_num: string, hotspotUpdate: Record<string,any>) => {
    try{
        const res = await api.put(`waste/update-waste-hotspot/${wh_num}/`, {
            wh_date: hotspotUpdate.date,
            wh_start_time: hotspotUpdate.start_time,
            wh_end_time: hotspotUpdate.end_time,
            wh_add_info: hotspotUpdate.additionalInstructions,
            sitio_id: hotspotUpdate.sitio,
            wstp_id: hotspotUpdate.watchman,
        })
        return res.data
    } catch (err){
        console.error(err)
    }
}

export const archiveHotspot = async (wh_num: number) => {
    try {
        const res = await api.put(`waste/update-waste-hotspot/${wh_num}/`, {
            wh_is_archive: true
        });
        return res.data;
    } catch (err) {
        console.error("Error archiving waste hotspot:", err);
        throw err;
    }
};
