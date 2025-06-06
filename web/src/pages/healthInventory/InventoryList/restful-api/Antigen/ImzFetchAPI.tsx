import {api} from "@/pages/api/api";


export const getImzSup = async () => {
    try {
      const res = await api.get("inventory/imz_supplies/");
      if (res.status === 200) {
        return res.data;
      }
      console.error(res.status);
      return []; 
    } catch (err) {
      console.log(err);
      return[]
    }
  };