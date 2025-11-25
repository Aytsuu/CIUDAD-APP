import { api } from "@/api/api";

export const getSitio = async () => {
    try{
          const res = await api.get('waste/sitio/');
          return res.data
    } catch (err){
        // console.error(err)
        throw err
    }
}

export const pendingRequests = async (rp_id: string) => {
    try{
        const res = await api.get(`/waste/garbage-pickup-pending/${rp_id}`)
        return res.data
    }catch(err){
        // console.error(err)
        throw err
    }
}