import { api } from "@/api/api";


export const getWatchman = async () => {
    try{
          const res = await api.get('waste/waste-watchman/');
          return res.data
    } catch (err){
        console.error(err)
    }
}

export const getSitio = async () => {
    try{
          const res = await api.get('waste/sitio/');
          return res.data
    } catch (err){
        console.error(err)
    }
}

export const getHotspotRecords = async () => {
    try{
        const res = await api.get('waste/waste-hotspot/');
        return res.data
    } catch (err){
        console.error(err)
    }
}