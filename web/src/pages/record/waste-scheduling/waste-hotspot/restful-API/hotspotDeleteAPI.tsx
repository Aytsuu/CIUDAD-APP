import { api } from "@/api/api";

export const archiveHotspot = async (wh_num: string) => {
    try{
        const res = await api.put(`waste/update-waste-hotspot/${wh_num}/`, {
            wh_is_archive: true
        })
    } catch (err){
        console.error(err)
    }
}