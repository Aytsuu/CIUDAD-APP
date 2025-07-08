import { api } from "@/api/api";

export const deleteHotspot = async (wh_num: string) => {
    try{
        const res = await api.delete(`waste/delete-waste-hotspot/${wh_num}/`);

    } catch(err){
        console.error(err)
    }
}

