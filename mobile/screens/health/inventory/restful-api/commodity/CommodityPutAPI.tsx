
import {api2} from "@/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const updateCommodity = async (com_id: string, data:Record<string,string>) => {
  
    try {
      const res = await api2.patch(`inventory/update_commoditylist/${com_id}/`, {
        com_name: toTitleCase(data.com_name),
        user_type: data.user_type,
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };

