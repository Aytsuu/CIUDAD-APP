
import {api2} from "@/api/api";

export const getFirstAid = async () => {
    try {
      const res = await api2.get("inventory/firstaidlist/");
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