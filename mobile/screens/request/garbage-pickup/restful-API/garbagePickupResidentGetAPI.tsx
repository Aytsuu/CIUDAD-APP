import { api } from "@/api/api";

export const getSitio = async () => {
    try{
          const res = await api.get('waste/sitio/');
          return res.data
    } catch (err){
        console.error(err)
    }
}