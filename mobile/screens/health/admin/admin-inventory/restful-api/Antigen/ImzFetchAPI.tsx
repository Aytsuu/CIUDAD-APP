import {api2} from "@/api/api";


export const getImzSup = async () => {
    try {
      const res = await api2.get("inventory/imz_supplies/");
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